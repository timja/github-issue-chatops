const enabled = {
  enabled: true,
};

function notEnabled(command) {
  return {
    enabled: false,
    error: `The ${command} is not enabled for this repository`,
  };
}

export function transferEnabled(config) {
  if (!config.commands.transfer.enabled) {
    return notEnabled("transfer");
  }

  return enabled;
}

export function labelEnabled(config, labels) {
  const labelConfig = config.commands.label;

  if (!labelConfig.enabled) {
    return notEnabled("label");
  }

  if (
    // if length is = 0 then all labels are allowed
    labelConfig.allowedLabels.length > 0 &&
    !labels.every((label) => labelConfig.allowedLabels.includes(label))
  ) {
    return {
      enabled: false,
      error: `${labels} doesn't match the allowed labels \`${labelConfig.allowedLabels.join(
        ","
      )}\``,
    };
  }

  return enabled;
}

export function closeEnabled(config) {
  if (!config.commands.close.enabled) {
    return notEnabled("close");
  }

  return enabled;
}

export function reopenEnabled(config) {
  if (!config.commands.reopen.enabled) {
    return notEnabled("reopen");
  }

  return enabled;
}

export function removeLabelEnabled(config, labels) {
  const labelConfig = config.commands.removeLabel;
  if (!labelConfig.enabled) {
    return notEnabled("remove-label");
  }

  if (
    // if length is = 0 then all labels are allowed
    labelConfig.allowedLabels.length > 0 &&
    !labels.every((label) => labelConfig.allowedLabels.includes(label))
  ) {
    return {
      enabled: false,
      error: `${labels} doesn't match the allowed labels \`${labelConfig.allowedLabels.join(
        ","
      )}\``,
    };
  }

  return enabled;
}

export function reviewerEnabled(config) {
  if (!config.commands.reviewer.enabled) {
    return notEnabled("reviewer");
  }

  return enabled;
}
