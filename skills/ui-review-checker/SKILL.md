---
name: ui-review-checker
description: Review product UI for information density, interaction clarity, mobile usability, and production-ready Japanese copy. Use when simplifying screens, checking whether settings overwhelm the primary task, polishing labels and descriptions, or auditing service-facing text before release.
---

# UI Review Checker

Review screens with one priority: make the primary task obvious and easy to complete on the first visit. Treat copy and layout as part of usability, not decoration.

## Review Workflow

1. Identify the primary task on the screen.
2. Separate always-needed information from optional settings and secondary stats.
3. Check whether a first-time user can understand what to do within three seconds.
4. Rewrite headings, labels, and helper text into service-ready Japanese.
5. Propose concrete file-level changes that reduce clutter without hiding necessary control.

## Layout Heuristics

- Keep one primary action per section.
- Keep the main task above optional settings.
- Collapse or move settings when they do not need to stay visible during task execution.
- Prefer one short summary sentence plus a few numbers over stacked explanatory cards.
- Avoid keeping more than three parallel status chips or badges around the main task.
- Make mobile interactions thumb-friendly with large tap targets and short forms.

## Copy Heuristics

- Write from the learner's point of view, not the implementation's point of view.
- Avoid internal language such as `MVP`, `rule-based`, `setup`, or backend names unless the user must act on them.
- Use headings that describe the outcome, not the component.
- Keep helper text specific and short.
- Mention AI only when it affects trust, scoring behavior, or user expectation.

## Output Format

- List findings from highest to lowest impact.
- For each finding, name the screen and the change direction.
- Prefer direct edits over abstract advice when the repository is available.
