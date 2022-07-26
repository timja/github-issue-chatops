export const defaultConfig = {
  commands: {
    label: {
      permission: "author-or-member",
      // TODO wildcard
      allowed_labels: ["enhancement"],
      enabled: true,
    },
    "remove-label": {
      permission: "none",
      // TODO wildcard
      allowed_labels: ["enhancement"],
      enabled: true,
    },
    reopen: {
      permission: "member",
      enabled: true,
    },
    reviewer: {
      permission: "none",
      enabled: true,
    },
    transfer: {
      permission: "write-single-or-author",
      enabled: true,
    },
  },
};
