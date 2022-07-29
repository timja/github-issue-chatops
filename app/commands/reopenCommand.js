import { reopenMatcher } from "../matchers.js";
import { reopenEnabled } from "../command-enabled.js";
import { reopenIssue } from "../github.js";
import { Command } from "./command.js";
import { actorRequest } from "./actorRequest.js";

export class ReopenCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return reopenMatcher(this.payload.comment.body);
  }

  enabled(config) {
    return reopenEnabled(config);
  }

  async run(authToken) {
    const sourceRepo = this.payload.repository.name;
    console.log(
      `${this.id} Re-opening issue ${
        this.payload.issue.html_url
      } ${actorRequest(this.payload)}`
    );
    await reopenIssue(authToken, sourceRepo, this.payload.issue.node_id);
  }
}
