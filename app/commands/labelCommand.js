import { labelMatcher } from "../matchers.js";
import { labelEnabled } from "../command-enabled.js";
import { addLabel } from "../github.js";
import { Command } from "./command.js";
import { actorRequest } from "./actorRequest.js";
import { extractCommaSeparated } from "../converters.js";

export class LabelCommand extends Command {
  constructor(id, payload) {
    super(id, payload);
  }

  matches() {
    return labelMatcher(this.payload.comment.body);
  }

  enabled(config) {
    const labels = extractCommaSeparated(this.matches()[1]);
    return labelEnabled(config, labels);
  }

  async run(authToken) {
    const labels = extractCommaSeparated(this.matches()[1]);
    const sourceRepo = this.payload.repository.name;

    console.log(
      `${this.id} Labeling issue ${
        this.payload.issue.html_url
      } with labels ${labels} ${actorRequest(this.payload)}`
    );
    await addLabel(
      authToken,
      this.payload.repository.owner.login,
      sourceRepo,
      this.payload.issue.node_id,
      labels
    );
  }
}
