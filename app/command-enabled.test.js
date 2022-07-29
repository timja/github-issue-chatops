import {
  closeEnabled,
  labelEnabled,
  removeLabelEnabled,
  reopenEnabled,
  reviewerEnabled,
  transferEnabled,
} from "./command-enabled.js";

describe("command-enabled", () => {
  describe("transferEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = transferEnabled({
        commands: {
          transfer: {
            enabled: true,
          },
        },
      });

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = transferEnabled({
        commands: {
          transfer: {
            enabled: false,
          },
        },
      });

      expect(sut.enabled).toEqual(false);
    });
  });

  describe("labelEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: true,
              allowedLabels: [],
            },
          },
        },
        ["label1"]
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: false,
              allowedLabels: [],
            },
          },
        },
        ["label1"]
      );

      expect(sut.enabled).toEqual(false);
    });

    test("is enabled when label is in allowedLabels", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: true,
              allowedLabels: ["label2", "label1"],
            },
          },
        },
        ["label1"]
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when label is not in allowedLabels", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: true,
              allowedLabels: ["label2", "label1"],
            },
          },
        },
        ["label4"]
      );

      expect(sut.enabled).toEqual(false);
    });
    test("is enabled when all labels are in allowedLabels", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: true,
              allowedLabels: ["label2", "label1", "label3", "label4"],
            },
          },
        },
        ["label3", "label1", "label2"]
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when not all labels are in allowedLabels", () => {
      const sut = labelEnabled(
        {
          commands: {
            label: {
              enabled: true,
              allowedLabels: ["label2", "label1", "label3", "label4"],
            },
          },
        },
        ["label2", "label1", "label5"]
      );

      expect(sut.enabled).toEqual(false);
    });
  });

  describe("closeEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = closeEnabled({
        commands: {
          close: {
            enabled: true,
          },
        },
      });

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = closeEnabled({
        commands: {
          close: {
            enabled: false,
          },
        },
      });

      expect(sut.enabled).toEqual(false);
    });
  });
  describe("reopenEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = reopenEnabled({
        commands: {
          reopen: {
            enabled: true,
          },
        },
      });

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = reopenEnabled({
        commands: {
          reopen: {
            enabled: false,
          },
        },
      });

      expect(sut.enabled).toEqual(false);
    });
  });

  describe("removeLabelEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: true,
              allowedLabels: [],
            },
          },
        },
        ["label1"]
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: false,
              allowedLabels: [],
            },
          },
        },
        ["label1"]
      );

      expect(sut.enabled).toEqual(false);
    });

    test("is enabled when label is in allowedLabels", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: true,
              allowedLabels: ["label2", "label1"],
            },
          },
        },
        ["label1"]
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when label is not in allowedLabels", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: true,
              allowedLabels: ["label2", "label1"],
            },
          },
        },
        ["label4"]
      );

      expect(sut.enabled).toEqual(false);
    });
    test("is enabled when all labels are in allowedLabels", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: true,
              allowedLabels: ["label2", "label1", "label3", "label4"],
            },
          },
        },
        ["label3", "label1", "label2"]
      );

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when not all labels are in allowedLabels", () => {
      const sut = removeLabelEnabled(
        {
          commands: {
            removeLabel: {
              enabled: true,
              allowedLabels: ["label2", "label1", "label3", "label4"],
            },
          },
        },
        ["label2", "label1", "label5"]
      );

      expect(sut.enabled).toEqual(false);
    });
  });

  describe("reviewerEnabled", () => {
    test("is enabled when config is enabled", () => {
      const sut = reviewerEnabled({
        commands: {
          reviewer: {
            enabled: true,
          },
        },
      });

      expect(sut.enabled).toEqual(true);
    });
    test("is disabled when config is disabled", () => {
      const sut = reviewerEnabled({
        commands: {
          reviewer: {
            enabled: false,
          },
        },
      });

      expect(sut.enabled).toEqual(false);
    });
  });
});
