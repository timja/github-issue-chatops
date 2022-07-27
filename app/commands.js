import {
  closeMatcher,
  labelMatcher,
  removeLabelMatcher,
  reopenMatcher,
  reviewerMatcher,
  transferMatcher,
} from "./matchers.js";
import {
  closeEnabled,
  labelEnabled,
  removeLabelEnabled,
  reopenEnabled,
  reviewerEnabled,
  transferEnabled,
} from "./command-enabled.js";

export function getCommands(commentBody) {
  return {
    transfer: {
      matches: transferMatcher(commentBody),
      enabled: (config, octokit) => transferEnabled(octokit, config),
    },
    close: {
      matches: closeMatcher(commentBody),
      enabled: (config, octokit) => closeEnabled(config, octokit),
    },
    reopen: {
      matches: reopenMatcher(commentBody),
      enabled: (config, octokit) => reopenEnabled(config, octokit),
    },
    label: {
      matches: labelMatcher(commentBody),
      enabled: (octokit, config, labels) =>
        labelEnabled(octokit, config, labels),
    },
    "remove-label": {
      matches: removeLabelMatcher(commentBody),
      enabled: (config, octokit, labels) =>
        removeLabelEnabled(config, octokit, labels),
    },
    reviewer: {
      matches: reviewerMatcher(commentBody),
      enabled: (config, octokit) => reviewerEnabled(config, octokit),
    },
  };
}

export function noneMatch(commands) {
  return !Object.values(commands).some((command) => command.matches);
}
