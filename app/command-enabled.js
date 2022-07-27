export function transferEnabled(octokit, config) {
  const transferConfig = config.commands.transfer;

  // TODO check permissions
  return {
    enabled: transferConfig.enabled,
  };
}

export function labelEnabled(octokit, config, labels) {
  const labelConfig = config.commands.label;

  if (!labelConfig.enabled) {
    return {
      enabled: false,
      error: "The label command is not enabled for this repository",
    };
  }

  // TODO set intersection
  if (
    labelConfig.allowed_labels.length > 0 &&
    !labels.includes(labelConfig.allowed_labels[0])
  ) {
    return {
      enabled: false,
      error: `${labels} doesn't match the allowed labels \`${labelConfig.allowed_labels.join(
        ","
      )}\``,
    };
  }

  // TODO check permissions
  return {
    enabled: true,
  };
}

export function closeEnabled(config, octokit) {
  return {
    enabled: true,
  };
}

export function reopenEnabled(config, octokit) {
  return {
    enabled: true,
  };
}

export function removeLabelEnabled(config, octokit, labels) {
  return {
    enabled: true,
  };
}

export function reviewerEnabled(config, octokit) {
  return {
    enabled: true,
  };
}