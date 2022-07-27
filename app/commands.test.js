import { getCommands, noneMatch } from "./commands.js";

describe("commands", () => {
  test("noneMatch is true when nothing matches", () => {
    const commands = getCommands("nothing that would ever match");

    expect(noneMatch(commands)).toEqual(true);
  });

  test("noneMatch is false when something matches", () => {
    const commands = getCommands("/label one");

    expect(noneMatch(commands)).toEqual(false);
  });
  test("noneMatch is false when multiple matches", () => {
    const commands = getCommands("/label one /reviewer reviewer");

    expect(noneMatch(commands)).toEqual(false);
  });
});
