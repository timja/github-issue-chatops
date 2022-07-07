#!/usr/bin/env node
import {graphql} from '@octokit/graphql'
import {createServer} from 'http'
import {createNodeMiddleware, Webhooks} from '@octokit/webhooks';
import {createAppAuth} from "@octokit/auth-app"

const sourceOwner = process.env.SOURCE_OWNER || 'timja'

const targetOwner = process.env.TARGET_OWNER || 'timja'

const secret = process.env.WEBHOOK_SECRET;

const webhooks = new Webhooks({
  secret,
});

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
});

webhooks.on('issue_comment.created', async ({ id, payload }) => {
  const sourceRepo = payload.repository.name
  const transferMatches = payload.comment.body.match(/\/transfer ([a-zA-Z\d-]+)/)
  const actorRequest = `as requested by ${payload.sender.login}`
  if (transferMatches) {
    const targetRepo = transferMatches[1]
    console.log(`${id} Transferring issue ${payload.issue.html_url} to repo ${targetRepo} ${actorRequest}`)
    await transferIssue(await getAuthToken(payload.installation.id), sourceRepo, targetRepo, payload.issue.node_id)
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

  const labelMatches = payload.comment.body.match(/\/label ([a-zA-Z\d-]+)/)
  if (labelMatches) {
    console.log(`${id} Labeling issue ${payload.issue.node_id} ${actorRequest}`)
    return
  }

  const reviewerMatches = payload.comment.body.match(/\/reviewer ([a-zA-Z\d-]+)/)
  if (reviewerMatches) {
    console.log(`${id} Requesting review for TODO at ${payload.issue.html_url} ${actorRequest}`)
    await requestReviewers(await getAuthToken(payload.installation.id), sourceRepo, payload.issue.node_id, [], [])
  }
})

createServer(createNodeMiddleware(webhooks)).listen(3000);

async function requestReviewers(token, sourceRepo, issueId, users, teams) {
  try {
    const userIds = []
    const teamIds = []

    await graphql(
      `
  mutation($pullRequestId: ID!, $userIds: [ID!]!, $teamIds:[ID!]!) {
    requestReviews( input: {pullRequestId: $pullRequestId, userIds: $userIds, teamIds: $teamIds, union: true}) {
      issue {
        url
      }
    }
  }
  `,
      {
        pullRequestId: issueId,
        userIds: userIds,
        teamIds: teamIds,
        headers: {
          authorization: `token ${token}`,
        }
      }
    )


  } catch (err) {
    console.error('Failed to request reviewers issue', err)

    console.error(JSON.stringify(err.errors))
  }
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

async function transferIssue(token, sourceRepo, targetRepo, issueId) {
  try {

    const { target } = await graphql(
      `
	query($targetOwner: String!, $targetRepo: String!) {
		target: repository(owner: $targetOwner, name: $targetRepo) {
			id
		}
	}
  `,
      {
        targetOwner,
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

