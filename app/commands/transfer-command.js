import { transferMatcher } from "../matchers.js";
import { transferEnabled } from "../command-enabled.js";
import { transferIssue } from "../github.js";
import { Command } from "./command.js";
import { actorRequest } from "./actor-request.js";

export class TransferCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return transferMatcher(this.payload.comment.body);
  }

  enabled(config) {
    return transferEnabled(config);
  }

  async run(authToken) {
    const targetRepo = this.matches()[1];
    const sourceRepo = this.payload.repository.name;
    console.log(
      `${this.id} Transferring issue ${
        this.payload.issue.html_url
      } to repo ${targetRepo} ${actorRequest(this.payload)}`
    );
    await transferIssue(
      authToken,
      this.payload.repository.owner.login,
      sourceRepo,
      targetRepo,
      this.payload.issue.node_id
    );
  }
}
