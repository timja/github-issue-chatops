#!/usr/bin/env node
import {graphql} from '@octokit/graphql'
import {createServer} from 'http'
import {createNodeMiddleware, Webhooks} from '@octokit/webhooks';
import {createAppAuth} from "@octokit/auth-app"

const verbose = process.env.VERBOSE === 'true'

const secret = process.env.WEBHOOK_SECRET;
const port = parseInt(process.env.PORT || '3000', 10);

const webhooks = new Webhooks({
  secret,
});

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
});

async function labelNameToId(token, login, repository, labelName) {
  const result = await graphql(
    `
  query($login: String!, $repository: String!, $labelName: String!) {
  repositoryOwner(login: $login) {
    repository(name: $repository) {
      label(name: $labelName) {
        id
      }
    }
  }
}
  `,
    {
      login,
      repository,
      labelName,
      headers: {
        authorization: `token ${token}`,
      }
    }
  )

  if (!result.repositoryOwner.repository.label) {
    return {
      err: 'NOT_FOUND',
      label: labelName
    }
  }

  return {
    id: result.repositoryOwner.repository.label.id
  }

}

webhooks.on('issue_comment.created', async ({id, payload}) => {
  const sourceRepo = payload.repository.name
  const transferMatches = payload.comment.body.match(/\/transfer ([a-zA-Z\d-]+)/)
  const actorRequest = `as requested by ${payload.sender.login}`
  if (transferMatches) {
    const targetRepo = transferMatches[1]
    console.log(`${id} Transferring issue ${payload.issue.html_url} to repo ${targetRepo} ${actorRequest}`)
    await transferIssue(await getAuthToken(payload.installation.id), payload.repository.owner.login, sourceRepo, targetRepo, payload.issue.node_id)
    return
  }

  const closeMatches = payload.comment.body.match(/\/close ?(not-planned)?/)
  if (closeMatches) {
    const reason = closeMatches.length > 1 && closeMatches[1] === 'not-planned' ? 'NOT_PLANNED' : 'COMPLETED'
    console.log(`${id} Closing issue ${payload.issue.html_url}, reason: ${reason} ${actorRequest}`)
    await closeIssue(await getAuthToken(payload.installation.id), sourceRepo, payload.issue.node_id, reason)
    return
  }

  const reopenMatches = payload.comment.body.match(/\/reopen/)
  if (reopenMatches) {
    console.log(`${id} Re-opening issue ${payload.issue.html_url} ${actorRequest}`)
    await reopenIssue(await getAuthToken(payload.installation.id), sourceRepo, payload.issue.node_id)
    return
  }

  const labelMatches = payload.comment.body.match(/\/label ([a-zA-Z\d-, ]+)/)
  if (labelMatches) {
    const labels = labelMatches[1].split(',')

    console.log(`${id} Labeling issue ${payload.issue.html_url} with labels ${labels} ${actorRequest}`)
    await addLabel(await getAuthToken(payload.installation.id), payload.repository.owner.login, sourceRepo, payload.issue.node_id, labels)
    return
  }

  const removeLabelMatches = payload.comment.body.match(/\/remove-label ([a-zA-Z\d-, ]+)/)
  if (removeLabelMatches) {
    const labels = removeLabelMatches[1].split(',')

    console.log(`${id} Removing label(s) from issue ${payload.issue.html_url}, labels ${labels} ${actorRequest}`)
    await removeLabel(await getAuthToken(payload.installation.id), payload.repository.owner.login, sourceRepo, payload.issue.node_id, labels)
    return
  }

  const reviewerMatches = payload.comment.body.match(/\/reviewers? ([@a-z/A-Z\d-,]+)/)
  if (reviewerMatches) {
    const reviewersToBeParsed = reviewerMatches[1].split(',')

    console.log(`${id} Requesting review for ${reviewersToBeParsed} at ${payload.issue.html_url} ${actorRequest}`)
    const reviewers = extractUsersAndTeams(payload.repository.owner.login, reviewersToBeParsed)
    await requestReviewers(await getAuthToken(payload.installation.id), payload.repository.owner.login, sourceRepo, payload.issue.node_id, reviewers.users, reviewers.teams)
    return
  }

  if (verbose) {
    console.log('No match for', payload.comment.body)
  }
})

function extractUsersAndTeams(orgName, reviewers) {
  return {
    teams: reviewers.filter(reviewer => reviewer.includes('/')),
    users: reviewers.filter(reviewer => !reviewer.includes('/')),
  }
}

createServer(createNodeMiddleware(webhooks)).listen(port);

async function lookupUser(token, username, originalUser) {
  const result = await graphql(
    `
      query($login :String!) {
        repositoryOwner(login: $login) {
          ... on User {
            id
          }
        }
      }
    `, {
      login: username,
      headers: {
        authorization: `token ${token}`,
      }
    }
  )

  if (!result.repositoryOwner) {
    return {
      err: 'NOT_FOUND',
      user: originalUser,
    }
  }

  return {
    id: result.repositoryOwner?.id
  }
}

async function lookupTeam(token, organization, teamName, originalTeamName) {
  const result = await graphql(
    `
    query($login :String!, $teamName:String!) {
      organization(login: $login) {
        team(slug: $teamName) {
          id
        }
      }
    }
    `, {
      login: organization,
      teamName: teamName,
      headers: {
        authorization: `token ${token}`,
      }
    }
  )

  if (!result.organization.team) {
    return {
      err: 'NOT_FOUND',
      team: originalTeamName,
    }
  }

  return {
    id: result.organization.team.id
  }
}

async function addLabel(token, login, repository, labelableId, labels) {
  try {
    const convertedLabels = await Promise.all(labels
      .map(async label => await labelNameToId(token, login, repository, label))
    )

    const invalidLabels = convertedLabels.filter(result => result.err !== undefined)
      .map(result => result.label)

    const labelIds = convertedLabels.filter(result => result.id !== undefined)
      .map(result => result.id)

    await graphql(
      `
  mutation($labelableId: ID!, $labelIds: [ID!]!) {
    addLabelsToLabelable(input: {
      labelableId: $labelableId,
      labelIds: $labelIds
    }) {
      clientMutationId
    }
  }
  `,
      {
        labelableId,
        labelIds,
        headers: {
          authorization: `token ${token}`,
        }
      }
    )

    if (invalidLabels.length || invalidLabels.length) {

      const comment = `I wasn't able to add the following labels: ${invalidLabels.join(',')}

Check that the label exists and is spelt right then try again.
      `

      await reportError(token, labelableId, comment);
    }

  } catch (err) {
    console.error('Failed to add label', err)

    console.error(JSON.stringify(err.errors))
  }
}

async function removeLabel(token, login, repository, labelableId, labels) {
  try {
    const convertedLabels = await Promise.all(labels
      .map(async label => await labelNameToId(token, login, repository, label))
    )

    const invalidLabels = convertedLabels.filter(result => result.err !== undefined)
      .map(result => result.label)

    const labelIds = convertedLabels.filter(result => result.id !== undefined)
      .map(result => result.id)

    await graphql(
      `
  mutation($labelableId: ID!, $labelIds: [ID!]!) {
    removeLabelsFromLabelable(input: {
      labelableId: $labelableId,
      labelIds: $labelIds
    }) {
      clientMutationId
    }
  }
  `,
      {
        labelableId,
        labelIds,
        headers: {
          authorization: `token ${token}`,
        }
      }
    )

    if (invalidLabels.length || invalidLabels.length) {

      const comment = `I wasn't able to remove the following labels: ${invalidLabels.join(',')}

Check that the label exists and is spelt right then try again.
      `

      await reportError(token, labelableId, comment);
    }

  } catch (err) {
    console.error('Failed to add label', err)

    console.error(JSON.stringify(err.errors))
  }
}

async function requestReviewers(token, organization, sourceRepo, issueId, users, teams) {
  try {
    const convertedUsers = await Promise.all(users
      .map(user => {
        return {
          original_user: user,
          user: user.replace(/^@/, ''),
        }
      })
      .map(async result => await lookupUser(token, result.user, result.original_user))
    )

    const invalidUsers = convertedUsers.filter(result => result.err !== undefined)
      .map(result => result.user)

    const userIds = convertedUsers.filter(result => result.id !== undefined)
      .map(result => result.id)

    const convertedTeams = await Promise.all(teams
      .map(teamSlug => {
        return {
          original_team: teamSlug,
          team: teamSlug.replace(`@${organization}/`, '')
        }
      })
      .map(async result => await lookupTeam(token, organization, result.team, result.original_team))
    )

    const invalidTeams = convertedTeams.filter(result => result.err !== undefined)
      .map(result => result.team)

    const teamIds = convertedTeams.filter(result => result.id !== undefined)
      .map(result => result.id)

    await graphql(
      `
  mutation($pullRequestId: ID!, $userIds: [ID!]!, $teamIds:[ID!]!) {
    requestReviews( input: {pullRequestId: $pullRequestId, userIds: $userIds, teamIds: $teamIds, union: true}) {
      pullRequest {
        url
      }
    }
  }
  `,
      {
        pullRequestId: issueId,
        userIds,
        teamIds,
        headers: {
          authorization: `token ${token}`,
        }
      }
    )

    if (invalidUsers.length || invalidTeams.length) {
      const invalidReviewers = [...invalidUsers, ...invalidTeams]

      const comment = `I wasn't able to request review for the following: ${invalidReviewers.join(',')}

Check that the reviewer is spelt right and try again.
      `

      await reportError(token, issueId, comment);
    }


  } catch (err) {
    console.error('Failed to request reviewers', err)

    console.error(JSON.stringify(err.errors))
  }
}

async function reportError(token, subjectId, comment) {
  await graphql(
    `
    mutation($comment: String!, $subjectId: ID!) {
      addComment(input: {
        subjectId: $subjectId,
        body: $comment
      }) {
        commentEdge {
          node {
            id
          }
        }
      }
    }
    `,
    {
      comment,
      subjectId,
      headers: {
        authorization: `token ${token}`,
      }
    }
  )
}


async function reopenIssue(token, sourceRepo, issueId) {
  try {
    await graphql(
      `
      mutation($issue: ID!) {
    		reopenIssue( input: {issueId: $issue}) {
    			issue {
    				url
    			}
    		}
    	}
  `,
      {
        issue: issueId,
        headers: {
          authorization: `token ${token}`,
        }
      }
    )


  } catch (err) {
    console.error('Failed to reopen issue', err)

    console.error(JSON.stringify(err.errors))
  }
}


async function closeIssue(token, sourceRepo, issueId, reason) {
  try {
    await graphql(
      `
      mutation($issue: ID!, $stateReason: IssueClosedStateReason) {
    		closeIssue( input: {issueId: $issue, stateReason: $stateReason}) {
    			issue {
    				url
    			}
    		}
    	}
  `,
      {
        issue: issueId,
        stateReason: reason,
        headers: {
          authorization: `token ${token}`,
        }
      }
    )


  } catch (err) {
    console.error('Failed to close issue', err)

    console.error(JSON.stringify(err.errors))
  }
}

async function getAuthToken(installationId) {
  const result = await auth({
    type: "installation",
    installationId
  });
  return result.token
}

async function transferIssue(token, owner, sourceRepo, targetRepo, issueId) {
  try {

    const {target} = await graphql(
      `
	query($owner: String!, $targetRepo: String!) {
		target: repository(owner: $owner, name: $targetRepo) {
			id
		}
	}
  `,
      {
        owner,
        targetRepo,
        headers: {
          authorization: `token ${token}`,
        },
      }
    );

    await graphql(
      `
  mutation($issue: ID!, $repo: ID!) {
		transferIssue(input: {issueId: $issue, repositoryId: $repo}) {
			issue {
				url
			}
		}
	}
  `,
      {
        issue: issueId,
        repo: target.id,
        headers: {
          authorization: `token ${token}`,
        }
      }
    )
  } catch (err) {
    console.error('Failed to transfer issue', err)

    console.error(JSON.stringify(err.errors))
  }
}

