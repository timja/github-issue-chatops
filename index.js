#!/usr/bin/env node
import { createServer } from "http";
import { createNodeMiddleware, Webhooks } from "@octokit/webhooks";
import { createAppAuth } from "@octokit/auth-app";
import {
  addLabel,
  closeIssue,
  removeLabel,
  reopenIssue,
  requestReviewers,
  transferIssue,
} from "./app/github.js";
import { getAuthToken } from "./app/auth.js";

const verbose = process.env.VERBOSE === "true";

const secret = process.env.WEBHOOK_SECRET;
const port = parseInt(process.env.PORT || "3000", 10);

const webhooks = new Webhooks({
  secret,
});

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
});

webhooks.on("issue_comment.created", async ({ id, payload }) => {
  const sourceRepo = payload.repository.name;
  const transferMatches = payload.comment.body.match(
    /\/transfer ([a-zA-Z\d-]+)/
  );
  const actorRequest = `as requested by ${payload.sender.login}`;
  if (transferMatches) {
    const targetRepo = transferMatches[1];
    console.log(
      `${id} Transferring issue ${payload.issue.html_url} to repo ${targetRepo} ${actorRequest}`
    );
    await transferIssue(
      await getAuthToken(auth, payload.installation.id),
      payload.repository.owner.login,
      sourceRepo,
      targetRepo,
      payload.issue.node_id
    );
    return;
  }

  const closeMatches = payload.comment.body.match(/\/close ?(not-planned)?/);
  if (closeMatches) {
    const reason =
      closeMatches.length > 1 && closeMatches[1] === "not-planned"
        ? "NOT_PLANNED"
        : "COMPLETED";
    console.log(
      `${id} Closing issue ${payload.issue.html_url}, reason: ${reason} ${actorRequest}`
    );
    await closeIssue(
      await getAuthToken(auth, payload.installation.id),
      sourceRepo,
      payload.issue.node_id,
      reason
    );
    return;
  }

  const reopenMatches = payload.comment.body.match(/\/reopen/);
  if (reopenMatches) {
    console.log(
      `${id} Re-opening issue ${payload.issue.html_url} ${actorRequest}`
    );
    await reopenIssue(
      await getAuthToken(auth, payload.installation.id),
      sourceRepo,
      payload.issue.node_id
    );
    return;
  }

  const labelMatches = payload.comment.body.match(/\/label ([a-zA-Z\d-, ]+)/);
  if (labelMatches) {
    const labels = labelMatches[1].split(",");

    console.log(
      `${id} Labeling issue ${payload.issue.html_url} with labels ${labels} ${actorRequest}`
    );
    await addLabel(
      await getAuthToken(auth, payload.installation.id),
      payload.repository.owner.login,
      sourceRepo,
      payload.issue.node_id,
      labels
    );
    return;
  }

  const removeLabelMatches = payload.comment.body.match(
    /\/remove-label ([a-zA-Z\d-, ]+)/
  );
  if (removeLabelMatches) {
    const labels = removeLabelMatches[1].split(",");

    console.log(
      `${id} Removing label(s) from issue ${payload.issue.html_url}, labels ${labels} ${actorRequest}`
    );
    await removeLabel(
      await getAuthToken(auth, payload.installation.id),
      payload.repository.owner.login,
      sourceRepo,
      payload.issue.node_id,
      labels
    );
    return;
  }

  const reviewerMatches = payload.comment.body.match(
    /\/reviewers? ([@a-z/A-Z\d-,]+)/
  );
  if (reviewerMatches) {
    const reviewersToBeParsed = reviewerMatches[1].split(",");

    console.log(
      `${id} Requesting review for ${reviewersToBeParsed} at ${payload.issue.html_url} ${actorRequest}`
    );
    const reviewers = extractUsersAndTeams(
      payload.repository.owner.login,
      reviewersToBeParsed
    );
    await requestReviewers(
      await getAuthToken(auth, payload.installation.id),
      payload.repository.owner.login,
      sourceRepo,
      payload.issue.node_id,
      reviewers.users,
      reviewers.teams
    );
    return;
  }

  if (verbose) {
    console.log("No match for", payload.comment.body);
  }
});

function extractUsersAndTeams(orgName, reviewers) {
  return {
    teams: reviewers.filter((reviewer) => reviewer.includes("/")),
    users: reviewers.filter((reviewer) => !reviewer.includes("/")),
  };
}

createServer(
  createNodeMiddleware(webhooks, {
    // Return 200 for health probes
    onUnhandledRequest: (request, res) => {
      res.setHeader("Content-Type", "text/plain");
      res.write("For webhooks POST to path /api/github/webhooks\n");
      res.end();
    },
  })
).listen(port, () => {
  console.log(`Listening for events on port ${port}`);
});
