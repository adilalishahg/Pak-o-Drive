---
name: agent-efficiency-suite
description: Autonomous performance, cost-efficiency, token optimization, and zero-error execution protocol for AI agents. Governs chunk-diff editing, automated compiler verification, dynamic tool discovery via Monid, smart caching, and persistent memory maintenance.
---

# ⚡ Autonomous Agent Efficiency & Cost Optimization Suite

This skill enforces best-in-class agent autonomy, token preservation, and zero-error execution standards.

---

## 1. 🪙 Token & Budget Preservation Protocol
* **Strict Targeted Chunk Editing**: NEVER rewrite whole files (>50 lines). Always use pinpoint chunk replacement (`replace_file_content` / `multi_replace_file_content`) to save 80-90% output tokens.
* **Prompt Caching Discipline**: Maintain immutable prefix structures in system instructions and project context to maximize 90% prompt caching discount.
* **On-Demand Gateway Discovery**: Use `monid discover` and `monid run` for ad-hoc scrapers, web intelligence, and external APIs instead of managing expensive subscriptions.

---

## 2. 🎯 Zero-Error & Autonomous Verification Loop
* **Pre-Push Typecheck**: Always run `pnpm tsc --noEmit` (or project equivalent) after modifying TypeScript files.
* **Self-Healing Loop**: If a build or typecheck fails, diagnose the error and fix it autonomously before reporting completion.
* **No Speculative Coding**: Use `grep_search` and `view_file` to verify existing interfaces, types, and imports before writing new code.

---

## 3. 🧠 Persistent Dynamic Memory Governance
* On every resolved task, append a date-stamped entry to `.agents/LEARNINGS.md` using the strict 3-bullet format:
  1. `📌 Issue`: Precise problem description.
  2. `🔍 Root Cause & Failed Attempts`: Why it happened and what failed.
  3. `🛠️ Verified Code Fix`: Exact changes, files updated, and verification commands.

---

## 4. 🧭 Intelligent Task & Model Routing Guidelines
* **Fast / Flash Mode** (Default): Routine edits, UI styling, refactoring, CLI operations, and unit tests.
* **Heavy Reasoning Mode**: Complex multi-service architecture, database schema redesigns, difficult concurrency bugs.
* **Slash Command Triggers**:
  - Recommend `/goal` when the task requires long autonomous multi-step execution.
  - Recommend `/grill-me` when architectural ambiguity needs interactive clarification.
  - Recommend `/learn` when persisting new domain rules.
