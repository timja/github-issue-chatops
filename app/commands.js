import { TransferCommand } from "./commands/transferCommand.js";
import { CloseCommand } from "./commands/closeCommand.js";
import { ReopenCommand } from "./commands/reopenCommand.js";
import { LabelCommand } from "./commands/labelCommand.js";
import { RemoveLabelCommand } from "./commands/removeLabelCommand.js";
import { ReviewerCommand } from "./commands/reviewerCommand.js";

export function getCommands(id, payload) {
  return {
    transfer: new TransferCommand(id, payload),
    close: new CloseCommand(id, payload),
    reopen: new ReopenCommand(id, payload),
    label: new LabelCommand(id, payload),
    removeLabel: new RemoveLabelCommand(id, payload),
    reviewer: new ReviewerCommand(id, payload),
  };
}

export function noneMatch(commands) {
  return !Object.values(commands).some((command) => command.matches);
}
