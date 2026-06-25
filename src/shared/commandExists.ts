import * as path from "node:path";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { runProcess } from "./process";

export async function commandExists(command: string): Promise<boolean> {
  const trimmedCommand = command.trim();

  if (trimmedCommand.length === 0) {
    return false;
  }

  if (looksLikePath(trimmedCommand)) {
    return fileIsExecutable(trimmedCommand);
  }

  try {
    const lookupCommand = process.platform === "win32" ? "where.exe" : "which";
    await runProcess(lookupCommand, [trimmedCommand]);
    return true;
  } catch {
    return false;
  }
}

async function fileIsExecutable(filePath: string): Promise<boolean> {
  try {
    await access(filePath, process.platform === "win32" ? constants.F_OK : constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function looksLikePath(command: string): boolean {
  return path.isAbsolute(command) || command.includes("/") || command.includes("\\");
}
