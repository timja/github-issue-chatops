import { extractUsersAndTeams } from "./converters.js";

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
  });
});
