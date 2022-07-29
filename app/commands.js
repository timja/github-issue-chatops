import { TransferCommand } from "./commands/transfer-command.js";
import { CloseCommand } from "./commands/close-command.js";
import { ReopenCommand } from "./commands/reopen-command.js";
import { LabelCommand } from "./commands/label-command.js";
import { RemoveLabelCommand } from "./commands/remove-label-command.js";
import { ReviewerCommand } from "./commands/reviewer-command.js";

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
  return !commands.some((command) => {
    return command.matches() !== null;
  });
}
