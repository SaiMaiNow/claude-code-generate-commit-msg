import { ExtensionConfig } from "../../config/extensionConfig";
import { CommandLineProvider, CommandLineProviderConfig } from "./commandLineProvider";

export class CustomCommandProvider extends CommandLineProvider {
  constructor(private readonly config: ExtensionConfig) {
    super("custom-command", "Custom Command");
  }

  protected getConfig(): CommandLineProviderConfig {
    return this.config.getCustomCommandConfig();
  }
}
