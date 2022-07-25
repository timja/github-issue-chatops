import { extractCommaSeparated, extractUsersAndTeams } from "./converters.js";

describe("converters", () => {
  describe("extractUsersAndTeams", () => {
    test("single user", () => {
      const converted = extractUsersAndTeams("test-org", "@reviewer1");

      expect(converted).toEqual({
        users: ["@reviewer1"],
        teams: [],
      });
    });
    test("user and team", () => {
      const converted = extractUsersAndTeams(
        "test-org",
        "@reviewer1,@test-org/team-1"
      );

      expect(converted).toEqual({
        users: ["@reviewer1"],
        teams: ["@test-org/team-1"],
      });
    });
    test("multiple users and teams", () => {
      const converted = extractUsersAndTeams(
        "test-org",
        "@reviewer1,@test-org/team-1,@reviewer2,@test-org/team-2"
      );

      expect(converted).toEqual({
        users: ["@reviewer1", "@reviewer2"],
        teams: ["@test-org/team-1", "@test-org/team-2"],
      });
    });
    test("space separated users and teams", () => {
      const converted = extractUsersAndTeams(
        "test-org",
        "@reviewer1 @test-org/team-1 @reviewer2 @test-org/team-2"
      );

      expect(converted).toEqual({
        users: ["@reviewer1", "@reviewer2"],
        teams: ["@test-org/team-1", "@test-org/team-2"],
      });
    });
    test("space and comma separated users and teams", () => {
      const converted = extractUsersAndTeams(
        "test-org",
        "@reviewer1 @test-org/team-1,@reviewer2 @test-org/team-2"
      );

      expect(converted).toEqual({
        users: ["@reviewer1", "@reviewer2"],
        teams: ["@test-org/team-1", "@test-org/team-2"],
      });
    });
    test("remove empty entry in comma separated users and teams", () => {
      const converted = extractUsersAndTeams(
        "test-org",
        "@reviewer1,@test-org/team-1,,@reviewer2,@test-org/team-2"
      );

      expect(converted).toEqual({
        users: ["@reviewer1", "@reviewer2"],
        teams: ["@test-org/team-1", "@test-org/team-2"],
      });
    });
    test("remove empty string entry in comma separated users and teams", () => {
      const converted = extractUsersAndTeams(
        "test-org",
        "@reviewer1,@test-org/team-1, ,@reviewer2,@test-org/team-2"
      );

      expect(converted).toEqual({
        users: ["@reviewer1", "@reviewer2"],
        teams: ["@test-org/team-1", "@test-org/team-2"],
      });
    });
  });
  describe("extractCommaSeparated", () => {
    test("split comma", () => {
      const labels = extractCommaSeparated("label1,label2");

      expect(labels).toEqual(expect.arrayContaining(actual));
    })
    test("remove empty entries in split", () => {
      const labels = extractCommaSeparated("label1,,label2");

      expect(labels).toEqual(expect.arrayContaining(actual));
    })
    test("remove empty string entries in split", () => {
      const labels = extractCommaSeparated("label1, ,label2");

      expect(labels).toEqual(expect.arrayContaining(actual));
    })
  })
});
