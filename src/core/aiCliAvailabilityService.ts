import { ExtensionConfig } from "../config/extensionConfig";
import { commandExists } from "../shared/commandExists";

export interface AiCliAvailability {
  readonly isAvailable: boolean;
  readonly providerId: string;
  readonly command: string;
  readonly reason?: "missing-command" | "command-not-found";
}

export class AiCliAvailabilityService {
  constructor(private readonly config: ExtensionConfig) {}

  async isSelectedProviderAvailable(): Promise<boolean> {
    const availability = await this.getSelectedProviderAvailability();

    return availability.isAvailable;
  }

  async getSelectedProviderAvailability(): Promise<AiCliAvailability> {
    const commitConfig = this.config.getCommitConfig();
    const command = this.getProviderCommand(commitConfig.provider)?.trim() ?? "";

    if (command.length === 0) {
      return {
        isAvailable: false,
        providerId: commitConfig.provider,
        command,
        reason: "missing-command"
      };
    }

    const isAvailable = await commandExists(command);

    return {
      isAvailable,
      providerId: commitConfig.provider,
      command,
      reason: isAvailable ? undefined : "command-not-found"
    };
  }

  private getProviderCommand(providerId: string): string | undefined {
    if (providerId === "claude-code") {
      return this.config.getClaudeCodeConfig().command;
    }

    if (providerId === "custom-command") {
      return this.config.getCustomCommandConfig().command;
    }

    return undefined;
  }
}
