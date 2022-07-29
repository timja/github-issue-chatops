import { getCommands, noneMatch } from "./commands.js";

describe("commands", () => {
  test("noneMatch is true when nothing matches", () => {
    const commands = getCommands("any", {
      comment: {
        body: "nothing that would every match",
      },
    });

    expect(noneMatch(commands)).toEqual(true);
  });

  test("noneMatch is false when something matches", () => {
    const commands = getCommands("any", {
      comment: {
        body: "/label one",
      },
    });

    expect(noneMatch(commands)).toEqual(false);
  });
  test("noneMatch is false when multiple matches", () => {
    const commands = getCommands("any", {
      comment: {
        body: "/label one \n/reviewer reviewer",
      },
    });

    expect(noneMatch(commands)).toEqual(false);
  });
});
