# Claude Code Generate Commit Message

Generate commit messages from Git diffs in VS Code. The default provider is Claude Code CLI, with a small provider layer that makes it easy to switch models or add another AI command later.

## Features

- Adds a `Generate Commit Message` button to the Source Control title bar.
- Hides the generate button when the selected AI CLI is not available.
- Hides the generate button when no Git repository is open.
- Reads diffs in `auto` mode by default: staged changes first, then unstaged changes.
- Writes the generated message back to the Git commit input box.
- Supports provider/model configuration through VS Code settings and commands.
- Includes a `custom-command` provider for alternate AI CLIs or local scripts.
- Keeps provider logic separate from VS Code command/UI wiring for easier maintenance.

## Requirements

- For the `claude-code` provider, install and sign in to Claude Code CLI.
- For the `custom-command` provider, configure a command that is available from the VS Code environment.

## Usage

1. Open a workspace that contains a Git repository.
2. Open the Source Control view.
3. Click `Generate Commit Message`.
4. Review the generated message in the Git commit input box, then commit as usual.

If the button is not visible, check that the selected AI CLI is installed and that the active workspace is a Git repository.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `claudeCommit.ai.provider` | `claude-code` | AI provider used for generation. |
| `claudeCommit.ai.model` | empty | Model name. Leave empty to use the provider default. |
| `claudeCommit.providers.claudeCode.command` | `claude` | Claude Code CLI command. |
| `claudeCommit.providers.claudeCode.arguments` | `["-p", "{prompt}"]` | Arguments for Claude Code CLI. |
| `claudeCommit.providers.claudeCode.modelArguments` | `["--model", "{model}"]` | Arguments appended when a model is configured. |
| `claudeCommit.providers.customCommand.command` | empty | Custom AI CLI command. |
| `claudeCommit.providers.customCommand.arguments` | `["{prompt}"]` | Arguments for the custom AI CLI. |
| `claudeCommit.providers.customCommand.modelArguments` | `["--model", "{model}"]` | Arguments appended when a model is configured. |
| `claudeCommit.git.diffMode` | `auto` | Diff source: `staged`, `unstaged`, or `auto`. |
| `claudeCommit.commit.style` | `conventional` | Commit style: `conventional` or `simple`. |
| `claudeCommit.commit.locale` | `en` | Language/locale for the generated commit message. |
| `claudeCommit.commit.maxSubjectLength` | `72` | Maximum subject line length. |

## Commands

- `AI Commit: Generate Commit Message`
- `AI Commit: Select AI Provider`
- `AI Commit: Select AI Model`

## Architecture

```text
src/
  extension.ts                  # VS Code activation and command wiring
  ai/
    aiProvider.ts               # provider contract
    providerRegistry.ts         # provider lookup/registration
    providers/
      commandLineProvider.ts    # reusable command-line provider base
      claudeCodeProvider.ts     # Claude Code CLI adapter
      customCommandProvider.ts  # configurable CLI adapter
  config/
    extensionConfig.ts          # typed VS Code settings
  core/
    aiCliAvailabilityService.ts # selected provider CLI availability check
    commitMessageService.ts     # orchestration use case
    gitInputWriter.ts           # write generated text to Git input box
    promptBuilder.ts            # prompt policy and formatting
  git/
    gitService.ts               # git repo discovery and diff reading
  shared/
    commandExists.ts            # cross-platform command lookup
    process.ts                  # child process helper
```

To add a provider:

1. Create a new file in `src/ai/providers/`.
2. Implement `AIProvider`.
3. Register it in `src/extension.ts`.
4. Add its configuration schema to `package.json`.

## Development

```bash
npm install
npm run compile
npm test
```

Open this repository in VS Code and press `F5` to run the Extension Development Host.

## Packaging

```bash
npm run package
```

This creates a `.vsix` file that can be installed locally or inspected before publishing to the VS Code Marketplace.
