# Claude Code Generate Commit Message

VS Code extension สำหรับ generate commit message จาก git diff โดย default ใช้ Claude Code CLI และออกแบบให้เพิ่ม AI provider/model ใหม่ได้ง่าย

## Features

- ปุ่ม `Generate Commit Message` บน Source Control title bar
- ซ่อนปุ่ม generate และแจ้งเตือนอัตโนมัติถ้าเครื่องยังไม่มี AI CLI ของ provider ที่เลือก
- ซ่อนปุ่ม generate อัตโนมัติถ้ายังไม่มี Git repository
- อ่าน diff แบบ `auto` เป็น default โดยใช้ staged changes ก่อน ถ้าไม่มีจะ fallback ไป unstaged changes
- เขียนผลลัพธ์กลับเข้า Git commit input box
- เปลี่ยน AI provider/model ผ่าน VS Code Settings หรือ command palette
- ใช้ `custom-command` provider เพื่อเรียก AI CLI อื่นได้โดยไม่ต้องแก้ source
- Provider architecture แยกจาก command/UI เพื่อ maintenance และต่อยอดได้ง่าย

## Requirements

- ถ้าใช้ provider `claude-code` ต้องติดตั้ง Claude Code CLI และ login ให้เรียบร้อย
- ถ้าใช้ provider `custom-command` ต้องตั้งค่า command ให้เรียกใช้งานได้จาก environment ของ VS Code

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `claudeCommit.ai.provider` | `claude-code` | AI provider ที่ใช้ generate |
| `claudeCommit.ai.model` | empty | model name ถ้าว่างจะใช้ default ของ provider |
| `claudeCommit.providers.claudeCode.command` | `claude` | Claude Code CLI command |
| `claudeCommit.providers.claudeCode.arguments` | `["-p", "{prompt}"]` | arguments หลักของ Claude Code CLI |
| `claudeCommit.providers.claudeCode.modelArguments` | `["--model", "{model}"]` | arguments ที่เพิ่มเมื่อมี model |
| `claudeCommit.providers.customCommand.command` | empty | custom AI CLI command |
| `claudeCommit.providers.customCommand.arguments` | `["{prompt}"]` | arguments ของ custom AI CLI |
| `claudeCommit.providers.customCommand.modelArguments` | `["--model", "{model}"]` | arguments ที่เพิ่มเมื่อมี model |
| `claudeCommit.git.diffMode` | `auto` | `staged`, `unstaged`, หรือ `auto` |
| `claudeCommit.commit.style` | `conventional` | `conventional` หรือ `simple` |
| `claudeCommit.commit.locale` | `en` | ภาษาของ commit message |
| `claudeCommit.commit.maxSubjectLength` | `72` | ความยาว subject line |

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

การเพิ่ม provider ใหม่ควรทำตาม pattern นี้:

1. สร้างไฟล์ใหม่ใน `src/ai/providers/`
2. implement `AIProvider`
3. register ใน `src/extension.ts`
4. เพิ่ม config schema ใน `package.json`

## Development

```bash
npm install
npm run compile
```

จากนั้นเปิด repo ใน VS Code แล้วกด `F5` เพื่อ run Extension Development Host
