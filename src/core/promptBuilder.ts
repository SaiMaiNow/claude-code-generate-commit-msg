import { CommitMessageRequest } from "../ai/aiProvider";

export function buildCommitPrompt(request: CommitMessageRequest): string {
  const styleInstruction =
    request.style === "conventional"
      ? "Use the Conventional Commits format, for example: feat: short summary."
      : "Use a concise imperative commit message.";

  return [
    "Generate exactly one git commit message for the following diff.",
    styleInstruction,
    `Write the message in locale: ${request.locale}.`,
    `Keep the subject line at or under ${request.maxSubjectLength} characters.`,
    "Return only the commit message. Do not include Markdown fences, explanations, or alternatives.",
    "If a body is useful, separate it from the subject with one blank line.",
    "",
    "Diff:",
    request.diff
  ].join("\n");
}
