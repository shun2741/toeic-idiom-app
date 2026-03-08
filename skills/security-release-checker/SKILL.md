---
name: security-release-checker
description: Review deployment and release plans for security, secret handling, hosting compatibility, and public exposure risk. Use when choosing a hosting target, making a repository public, exposing URLs to external users, or validating whether a deployment approach would leak secrets or disable required server features.
---

# Security Release Checker

Review release plans with one rule: do not trade away server-side safety just to make deployment easier.

## Review Workflow

1. Identify which parts of the app require server execution, secrets, cookies, or request-dependent logic.
2. Check whether the target hosting platform supports those features.
3. Reject deployment plans that would force secrets into the client or silently disable auth, APIs, rate limits, or logging.
4. Prefer the smallest public surface that still preserves secure server-side behavior.
5. Document concrete release blockers and the safer hosting alternative.

## Red Flags

- Static hosting for apps that use API routes, auth callbacks, cookies, middleware, or request-aware logic.
- Any plan that would expose `OPENAI_API_KEY` or service-role secrets to the browser.
- Public trial modes without rate limiting or abuse controls.
- Making a repo public without checking for committed env files, tokens, or secrets in history.

## Output Format

- Start with release blockers.
- State whether the requested hosting target is safe and functional.
- If not, name the safer alternative and the minimum changes needed to ship.
