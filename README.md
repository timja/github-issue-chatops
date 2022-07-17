# GitHub issue management - ChatOps

A tool for managing GitHub issues and pull requests via ChatOps.
It uses GitHub webhooks to scale across repositories without needing to add a GitHub action to each of them.

GitHub apps are used for authentication to limit the required permissions.

## Getting started

First you will need to create a GitHub app. Add the permissions required for the commands you are using.
Add a webhook to the app pointing at your endpoint, the path for the webhook receiver is `/api/github/webhooks`.

This app is multiple organization aware and doesn't need any additional configuration to run in multiple organizations.

_Note: You can't interact across organizations, like requesting reviews from teams in different organizations or transferring issues, this is a GitHub limitation._

### Local development

The easiest way to develop this locally is to use [smee](https://smee.io).

Run `smee --path /api/github/webhooks` and point your webhook to the smee url that is outputted e.g. https://smee.io/Mrl4d3W9AUxeaaa

The application runs on port 3000 by default, this can be customized with the `PORT` environment variable.

### Required environment variables

- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY`
- `WEBHOOK_SECRET`

## Supported commands

### /close

Closes the current issue

#### Permissions required

- Issues
  - Read and write

### /label <label1,label2,...>

Adds a label to the current issue or pull request

#### Permissions required

- Issues
  - Read and write
- Pull requests
  - Read and write

### /remove-label <label1,label2,...>

Removes a label from the current issue or pull request

#### Permissions required

- Issues
  - Read and write
- Pull requests
  - Read and write

### /reopen

Reopens the current issue

#### Permissions required

- Issues
  - Read and write

### /reviewer(s) <reviewer1,reviewer2,@org/team1...>

Adds reviewers to the pull request.

<!-- the GitHub API doesn't error in this case it comes back successful -->

_Note: If a team exists but the team doesn't have read access to the repository this will silently fail._

#### Permissions required

- Pull requests
  - Read and write
- Organizations -> Members
  - Read-only

### /transfer <destination_repo>

Transfers a GitHub issue to another repository in the same organization.

#### Permissions required

- Contents
  - Read and write
- Issues
  - Read and write
