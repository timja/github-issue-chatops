# GitHub issue management - ChatOps

This tool allows managing GitHub issues via ChatOps.
It uses GitHub webhooks to scale across repositories without needing to add a GitHub action to each of them.

GitHub apps are used for authentication to limit the required permissions.

## Getting started

First you will need to create a GitHub app. Add the permissions required for the commands you are using.
Add a webhook to the app pointing at your endpoint, the path for the webhook receiver is `/api/github/webhooks`.

### Local development

The easiest way to develop this locally is to use [smee](https://smee.io).

Run `smee --path /api/github/webhooks` and point your webhook to the smee url that is outputted e.g. https://smee.io/Mrl4d3W9AUxeaaa

### Required environment variables

- GITHUB_APP_ID
- GITHUB_APP_PRIVATE_KEY
- SOURCE_OWNER
- TARGET_OWNER
- WEBHOOK_SECRET

## Supported commands

### /close

Closes the current issue

#### Permissions required

- Issues
  - Read and write

### /reopen

Reopens the current issue

#### Permissions required

- Issues
  - Read and write

### /transfer <destination_repo>

Transfers a GitHub issue to another repository in the same organization.

#### Permissions required

- Contents
  - Read and write
- Issues
  - Read and write
