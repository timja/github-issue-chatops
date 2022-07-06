#!/usr/bin/env node
import { graphql } from '@octokit/graphql'
import { createServer } from 'http'
import { Webhooks, createNodeMiddleware } from '@octokit/webhooks';
import { createAppAuth } from "@octokit/auth-app"

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

webhooks.on('issue_comment.created', async ({ id, name, payload }) => {
  const sourceRepo = payload.repository.name
  const result = payload.comment.body.match(/\/transfer ([a-zA-Z0-9-]+)/)
  if (result) {
    const targetRepo = result[1]
    console.log(`${id} Transferring issue number ${payload.issue.number} to repo ${targetRepo}`)
    await transferIssue(sourceRepo, targetRepo, payload.issue.number)
  }
})

createServer(createNodeMiddleware(webhooks)).listen(3000);

async function transferIssue(sourceRepo, targetRepo, issue) {
  try {
    const installationAuthentication = await auth({
      type: "installation",
      installationId: process.env.GITHUB_APP_INSTALLATION_ID,
    });

    const token = installationAuthentication.token

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

