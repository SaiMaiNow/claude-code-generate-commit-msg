import { ExtensionConfig } from "../../config/extensionConfig";
import { CommandLineProvider, CommandLineProviderConfig } from "./commandLineProvider";

export class ClaudeCodeProvider extends CommandLineProvider {
  constructor(private readonly config: ExtensionConfig) {
    super("claude-code", "Claude Code");
  }

  protected getConfig(): CommandLineProviderConfig {
    return this.config.getClaudeCodeConfig();
  }
}
