import { TransferCommand } from "./commands/transferCommand.js";
import { CloseCommand } from "./commands/closeCommand.js";
import { ReopenCommand } from "./commands/reopenCommand.js";
import { LabelCommand } from "./commands/labelCommand.js";
import { RemoveLabelCommand } from "./commands/removeLabelCommand.js";
import { ReviewerCommand } from "./commands/reviewerCommand.js";

export function getCommands(id, payload) {
  return [
    new TransferCommand(id, payload),
    new CloseCommand(id, payload),
    new ReopenCommand(id, payload),
    new LabelCommand(id, payload),
    new RemoveLabelCommand(id, payload),
    new ReviewerCommand(id, payload),
  ];
}

export function noneMatch(commands) {
  return commands.some((command) => command.matches);
}
