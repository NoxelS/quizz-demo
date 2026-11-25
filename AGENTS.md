# Development Rules

## Conversational Style

- Keep answers short and concise
- No emojis in commits, issues, PR comments, or code
- No fluff or cheerful filler text (e.g., "Thanks @user" not "Thanks so much @user!")
- Technical prose only, be direct
- Use concise, clear, simple language. Define unavoidable jargon before using it.
- Explain non-trivial designs and problems as: problem, concrete example or short trace, then solution. State why the solution is necessary and distinguish it from optional complexity.
- Prefer concrete behavior and small illustrations over abstract summaries, dense terminology, or unexplained lists of changes.
- When the user asks a question, answer it first before making edits or running implementation commands.
- When responding to user feedback or an analysis, explicitly say whether you agree or disagree before saying what you changed.

## Implementation

- Fix the underlying cause of failures. Preserve intentional behavior and validation instead of weakening them to make a check pass.
- Keep generated output, local reports, credentials, and `.env` files out of commits. Use temporary files for ad-hoc scripts and CLI message bodies.

## Development Workflow

- Use test-driven development for behavior changes: identify the consumer-visible contract, write a focused test that fails because the behavior is missing, and run it to confirm the expected failure before implementation.
- Implement the smallest change that makes the test pass, then rerun that test and any directly relevant checks.
- Cover representative success, boundary, and failure cases when they matter to the contract; keep tests deterministic and independent of external credentials.
- Follow existing test conventions and assert observable outcomes, not implementation details. Do not add tests for trivial changes or require tests where no meaningful behavior changes.

## Tests

- Make tests readable to humans: use clear names, focused setup, and assertions that show expected consumer-visible behavior.
- Follow existing test conventions; cover meaningful success, boundary, and failure cases based on contract and risk, not implementation details.
- Keep tests isolated and deterministic. Avoid fixed sleeps and production services; mock only external or unsafe boundaries when needed.

## Dependencies

- Use pnpm and commit intentional `pnpm-lock.yaml` changes. To update dependencies, change the relevant metadata, regenerate with `pnpm install`, and verify a frozen-lockfile installation.
- Direct dependencies stay exact. Review release notes and compatibility when changing toolchain or runtime versions.

## Git and Pull Requests

- Other agents may share the worktree. Preserve their changes and limit commits to the files owned by the current task.
- Stage explicit paths, inspect `git status` and the staged diff, and use Conventional Commits. Never bypass hooks or overwrite unrelated changes through resets, cleanup, stashing, or force pushes.
- Prefer updating the task's existing branch and PR. Review other PRs through diffs and refs without switching the user's checkout.
- Describe the final behavior and relevant checks in the PR. Use structured API arguments or a temporary body file for multiline descriptions.
- Container publication, repository settings, and hosted-service activation need separate verification; a configuration file or successful local test does not prove they ran.
- Use conventional commit messages.

## AGENTS.md File

- Do not change the AGENTS.md file unsless specifically asked for.
