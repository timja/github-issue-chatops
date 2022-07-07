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
    await transferIssue(sourceRepo, targetRepo, payload.issue.number)
    return
  }

  const closeMatches = payload.comment.body.match(/\/close ?(not-planned)?/)
  if (closeMatches) {
    const reason = closeMatches.length > 1 && closeMatches[1] === 'not-planned' ? 'NOT_PLANNED' : 'COMPLETED'
    console.log(`${id} Closing issue ${payload.issue.html_url}, reason: ${reason} ${actorRequest}`)
    await closeIssue(sourceRepo, payload.issue.number, reason)
    return
  }

  const reopenMatches = payload.comment.body.match(/\/reopen/)
  if (reopenMatches) {
    console.log(`${id} Re-opening issue ${payload.issue.html_url} ${actorRequest}`)
    await reopenIssue(sourceRepo, payload.issue.number)
    return
  }

  const labelMatches = payload.comment.body.match(/\/label ([a-zA-Z\d-]+)/)
  if (labelMatches) {
    console.log(`${id} Labeling issue ${payload.issue.html_url} ${actorRequest}`)
    return
  }

  const reviewerMatches = payload.comment.body.match(/\/reviewer ([a-zA-Z\d-]+)/)
  if (reviewerMatches) {
    console.log(`${id} Requesting review for TODO at ${payload.issue.html_url} ${actorRequest}`)
  }
})

createServer(createNodeMiddleware(webhooks)).listen(3000);

async function findIssueId(sourceRepo, issue, token) {
  const {source} = await graphql(
    `
	query($issue: Int!, $sourceOwner: String!, $sourceRepo: String!) {
		source: repository(owner: $sourceOwner, name: $sourceRepo) {
			issue(number: $issue) {
				id
			}
		}
	}
  `,
    {
      sourceOwner,
      sourceRepo,
      issue,
      headers: {
        authorization: `token ${token}`,
      },
    }
  );
  return source.issue.id;
}

async function reopenIssue(sourceRepo, issue) {
  try {
    const { token } = await getAuthToken();
    const issueId = await findIssueId(sourceRepo, issue, token);

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
    console.error('Failed to close issue', err)

    console.error(JSON.stringify(err.errors))
  }
}


async function closeIssue(sourceRepo, issue, reason) {
  try {
    const { token } = await getAuthToken();
    const issueId = await findIssueId(sourceRepo, issue, token);

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

async function getAuthToken() {
  return await auth({
    type: "installation",
    installationId: process.env.GITHUB_APP_INSTALLATION_ID,
  });
}

async function transferIssue(sourceRepo, targetRepo, issue) {
  try {
    const { token } = await getAuthToken();


    const { source, target } = await graphql(
      `
	query($issue: Int!, $sourceOwner: String!, $sourceRepo: String!, $targetOwner: String!, $targetRepo: String!) {
		source: repository(owner: $sourceOwner, name: $sourceRepo) {
			issue(number: $issue) {
				id
			}
		}
		target: repository(owner: $targetOwner, name: $targetRepo) {
			id
		}
	}
  `,
      {
        sourceOwner,
        sourceRepo,
        targetOwner,
        targetRepo,
        issue,
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
        issue: source.issue.id,
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

