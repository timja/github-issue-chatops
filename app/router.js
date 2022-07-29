import { reportError } from "./github.js";
import { getAuthToken } from "./auth.js";
import { defaultConfig } from "./default-config.js";

import { Octokit } from "@octokit/core";
import { config as octoKitConfig } from "@probot/octokit-plugin-config";

import deepmerge from "deepmerge";
import { getCommands, noneMatch } from "./commands.js";

export async function router(auth, id, payload, verbose) {
  const sourceRepo = payload.repository.name;

  const commands = getCommands(id, payload);

  if (noneMatch(commands)) {
    console.log("none match");
    if (verbose) {
      console.log("No match for", payload.comment.body);
    }
    return;
  }

  const authToken = await getAuthToken(auth, payload.installation.id);
  const OctokitConfig = Octokit.plugin(octoKitConfig);
  const octokit = new OctokitConfig({ auth: authToken });

  // TODO validate against schema
  // noinspection JSUnusedGlobalSymbols
  const { config } = await octokit.config.get({
    owner: payload.repository.owner.login,
    repo: sourceRepo,
    path: ".github/comment-ops.yml",
    defaults: (configs) => deepmerge.all([defaultConfig, ...configs]),
  });

  const runCommands = commands.filter((command) => command.matches());
  for (const command of runCommands) {
    const result = command.enabled(config);
    result.enabled
      ? await command.run(authToken)
      : await reportError(authToken, payload.issue.node_id, result.error);
  }
}
