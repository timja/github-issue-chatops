import { Command } from "./command.js";
import { closeMatcher } from "../matchers.js";
import { closeEnabled } from "../command-enabled.js";
import { closeIssue } from "../github.js";
import { actorRequest } from "./actor-request.js";

export class CloseCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return closeMatcher(this.payload.comment.body);
  }

  enabled(config) {
    return closeEnabled(config);
  }

  async run(authToken) {
    const sourceRepo = this.payload.repository.name;
    const closeMatches = this.matches();
    const reason =
      closeMatches.length > 1 && closeMatches[1] === "not-planned"
        ? "NOT_PLANNED"
        : "COMPLETED";
    console.log(
      `${this.id} Closing issue ${
        this.payload.issue.html_url
      }, reason: ${reason} ${actorRequest(this.payload)}`
    );
    await closeIssue(authToken, sourceRepo, this.payload.issue.node_id, reason);
  }
}
