import {
  addLabel,
  closeIssue,
  removeLabel,
  reopenIssue,
  reportError,
  requestReviewers,
  transferIssue,
} from "./github.js";
import { getAuthToken } from "./auth.js";
import { extractCommaSeparated, extractUsersAndTeams } from "./converters.js";
import { defaultConfig } from "./default-config.js";

import { Octokit } from "@octokit/core";
import { config as octoKitConfig } from "@probot/octokit-plugin-config";

import deepmerge from "deepmerge";
import { getCommands, noneMatch } from "./commands.js";

export async function router(auth, id, payload, verbose) {
  const sourceRepo = payload.repository.name;
  const actorRequest = `as requested by ${payload.sender.login}`;

  const commands = getCommands(payload.comment.body);

  if (noneMatch(commands)) {
    if (verbose) {
      console.log("No match for", payload.comment.body);
    }
    return;
  }

  const authToken = await getAuthToken(auth, payload.installation.id);
  const OctokitConfig = Octokit.plugin(octoKitConfig);
  const octokit = new OctokitConfig({ auth: authToken });

  // TODO validate against schema
  const { config } = await octokit.config.get({
    owner: payload.repository.owner.login,
    repo: sourceRepo,
    path: ".github/comment-ops.yml",
    defaults: (configs) => deepmerge.all([defaultConfig, ...configs]),
  });

  const transferMatches = commands.transfer.matches;
  if (commands.transfer.matches) {
    const enabled = await commands.transfer.enabled(octokit, config);

    if (enabled) {
      const targetRepo = transferMatches[1];
      console.log(
        `${id} Transferring issue ${payload.issue.html_url} to repo ${targetRepo} ${actorRequest}`
      );
      await transferIssue(
        authToken,
        payload.repository.owner.login,
        sourceRepo,
        targetRepo,
        payload.issue.node_id
      );
      return;
    } else {
      await reportError(
        authToken,
        payload.issue.node_id,
        "/transfer is not enabled for this repository"
      );
    }
  }

  const closeMatches = commands.close.matches;
  if (closeMatches) {
    const reason =
      closeMatches.length > 1 && closeMatches[1] === "not-planned"
        ? "NOT_PLANNED"
        : "COMPLETED";
    console.log(
      `${id} Closing issue ${payload.issue.html_url}, reason: ${reason} ${actorRequest}`
    );
    await closeIssue(authToken, sourceRepo, payload.issue.node_id, reason);
    return;
  }

  const reopenMatches = commands.reopen.matches;
  if (reopenMatches) {
    console.log(
      `${id} Re-opening issue ${payload.issue.html_url} ${actorRequest}`
    );
    await reopenIssue(authToken, sourceRepo, payload.issue.node_id);
    return;
  }

  const labelMatches = commands.label.matches;
  if (labelMatches) {
    const labels = extractCommaSeparated(labelMatches[1]);
    const result = await commands.label.enabled(octokit, config, labels);

    if (result.enabled) {
      console.log(
        `${id} Labeling issue ${payload.issue.html_url} with labels ${labels} ${actorRequest}`
      );
      await addLabel(
        authToken,
        payload.repository.owner.login,
        sourceRepo,
        payload.issue.node_id,
        labels
      );
      return;
    } else {
      await reportError(authToken, payload.issue.node_id, result.error);
    }
  }

  const removeLabelMatches = commands["remove-label"].matches;
  if (removeLabelMatches) {
    const labels = extractCommaSeparated(removeLabelMatches[1]);

    console.log(
      `${id} Removing label(s) from issue ${payload.issue.html_url}, labels ${labels} ${actorRequest}`
    );
    await removeLabel(
      authToken,
      payload.repository.owner.login,
      sourceRepo,
      payload.issue.node_id,
      labels
    );
    return;
  }

  const reviewerMatches = commands.reviewer.matches;
  if (reviewerMatches) {
    console.log(
      `${id} Requesting review for ${reviewerMatches[1]} at ${payload.issue.html_url} ${actorRequest}`
    );
    const reviewers = extractUsersAndTeams(
      payload.repository.owner.login,
      reviewerMatches[1]
    );
    await requestReviewers(
      authToken,
      payload.repository.owner.login,
      sourceRepo,
      payload.issue.node_id,
      reviewers.users,
      reviewers.teams
    );
    return;
  }
}
