export function transferEnabled(octokit, config) {
  const transferConfig = config.commands.transfer;

  // TODO check permissions
  return transferConfig.enabled;
}

export function labelEnabled(octokit, config, labels) {
  const labelConfig = config.commands.label;

  if (!labelConfig.enabled) {
    return {
      enabled: false,
      error: "/label is not enabled for this repository",
    };
  }

  if (!labels.includes(labelConfig.allowed_labels[0])) {
    return {
      enabled: false,
      error: `${labels} doesn't match the allowed labels ${labelConfig.allowed_labels}`,
    };
  }

  // TODO check permissions
  return {
    enabled: true,
  };
}
