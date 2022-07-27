import {
  closeMatcher,
  labelMatcher,
  removeLabelMatcher,
  reopenMatcher,
  reviewerMatcher,
  transferMatcher,
} from "./matchers.js";
import { labelEnabled, transferEnabled } from "./command-enabled.js";

export function getCommands(commentBody) {
  return {
    transfer: {
      matches: transferMatcher(commentBody),
      enabled: (config, octokit) => transferEnabled(octokit, config),
    },
    close: {
      matches: closeMatcher(commentBody),
    },
    reopen: {
      matches: reopenMatcher(commentBody),
    },
    label: {
      matches: labelMatcher(commentBody),
      enabled: (octokit, config, labels) =>
        labelEnabled(octokit, config, labels),
    },
    "remove-label": {
      matches: removeLabelMatcher(commentBody),
    },
    reviewer: {
      matches: reviewerMatcher(commentBody),
    },
  };
}

export function noneMatch(commands) {
  return Object.keys(commands)
    .map((key) => !!commands[key].matches)
    .every((element) => element === false);
}
