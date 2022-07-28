import { reportError } from "./github.js";
import { getAuthToken } from "./auth.js";
import { defaultConfig } from "./default-config.js";

import { Octokit } from "@octokit/core";
import { config as octoKitConfig } from "@probot/octokit-plugin-config";

import deepmerge from "deepmerge";
import { getCommands, noneMatch } from "./commands.js";

export async function router(auth, id, payload, verbose) {
  const sourceRepo = payload.repository.name;

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
    const enabled = commands.transfer.enabled(octokit, config, transferMatches);

    if (enabled) {
      await commands.transfer.run(id, payload, authToken, transferMatches);
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
    await commands.close.run(id, payload, authToken, closeMatches);
  }

  const reopenMatches = commands.reopen.matches;
  if (reopenMatches) {
    await commands.reopen.run(id, payload, authToken, reopenMatches);
  }

  const labelMatches = commands.label.matches;
  if (labelMatches) {
    const result = commands.label.enabled(octokit, config, labelMatches);

    if (result.enabled) {
      await commands.label.run(id, payload, authToken, labelMatches);
    } else {
      await reportError(authToken, payload.issue.node_id, result.error);
    }
  }

  const removeLabelMatches = commands.removeLabel.matches;
  if (removeLabelMatches) {
    const result = commands.removeLabel.enabled(
      octokit,
      config,
      removeLabelMatches
    );

    if (result.enabled) {
      await commands.removeLabel.run(
        id,
        payload,
        authToken,
        removeLabelMatches
      );
    } else {
      await reportError(authToken, payload.issue.node_id, result.error);
    }
  }

  const reviewerMatches = commands.reviewer.matches;
  if (reviewerMatches) {
    await commands.reviewer.run(id, payload, authToken, reviewerMatches);
  }
}
