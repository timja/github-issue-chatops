export const defaultConfig = {
  commands: {
    label: {
      permission: "author-or-member",
      allowed_labels: [],
      enabled: true,
    },
    removeLabel: {
      permission: "none",
      allowed_labels: [],
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
