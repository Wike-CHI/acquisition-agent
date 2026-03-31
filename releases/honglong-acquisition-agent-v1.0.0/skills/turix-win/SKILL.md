---
name: turix
description: "Dispatch desktop-computer-use tasks to TuriX on Windows (alias: turix-win). Trigger when users mention turix, computer use, CUA, or ask to send a task to Turix. Run directly via {baseDir}/scripts/run_turix.ps1 in the current session; do not require a separate Turix sub-session/sessionKey."
user-invocable: true
---

# TuriX Skill (Windows)

This skill allows OpenClaw to control the Windows desktop visually using the TuriX Computer Use Agent.

## Required Repository Branch (Windows)

- Windows users must run TuriX from branch `multi-agent-windows`.
- Do NOT use branch `main` with this Windows skill.
- Recommended clone command:
```powershell
cd your_dir
git clone -b multi-agent-windows --single-branch https://github.com/TurixAI/TuriX-CUA.git
cd .\TuriX-CUA
git branch --show-current
```
- The branch check must print `multi-agent-windows`.
- `scripts/run_turix.ps1` also checks the active branch before launch (when `.git` metadata is available).

## Dispatch Rules (Critical)

- Trigger this skill when the user says `turix`, `TuriX`, `turix-win`, `computer use`, `CUA`, `desktop automation`, or asks to send a task to TuriX.
- Do not block on "no Turix sub-session found". A child session is optional, not required.
- Default behavior: dispatch immediately in the current session by running:
```powershell
powershell -ExecutionPolicy Bypass -File "{baseDir}/scripts/run_turix.ps1" "<TASK>"
```
- If the user explicitly asks for background execution:
```powershell
Start-Process powershell -ArgumentList "-ExecutionPolicy","Bypass","-File","{baseDir}/scripts/run_turix.ps1","<TASK>"
```
- If the user explicitly asks to continue an interrupted run:
```powershell
powershell -ExecutionPolicy Bypass -File "{baseDir}/scripts/run_turix.ps1" --resume <AGENT_ID>
```

## When to Use

- When asked to perform actions on the Windows desktop (e.g., "Open Spotify and play my liked songs").
- When navigating applications that lack command-line interfaces.
- For multi-step visual workflows (e.g., "Find the latest invoice in my email and upload it to the company portal").
- When you need the agent to plan, reason, and execute complex tasks autonomously.

## Key Features

### Multi-Model Architecture
TuriX uses a sophisticated multi-model system:
- Brain: Understands the task and generates step-by-step plans
- Actor: Executes precise UI actions based on visual understanding
- Planner: Coordinates high-level task decomposition (when `use_plan: true`)
- Memory: Maintains context across task steps

### Skills System
Skills are markdown playbooks that guide the agent for specific domains:
- `github-web-actions`: GitHub navigation, repo search, starring
- `browser-tasks`: General web browser operations
- Custom skills can be added to the `skills/` directory

### Resume Capability
The agent can resume interrupted tasks by setting a stable `agent_id`.

## Running TuriX

### Basic Task
```powershell
powershell -ExecutionPolicy Bypass -File "{baseDir}/scripts/run_turix.ps1" "Open Edge and go to github.com"
```

### Resume Interrupted Task
```powershell
powershell -ExecutionPolicy Bypass -File "{baseDir}/scripts/run_turix.ps1" --resume my-task-001
```

> Note: `run_turix.ps1` updates `examples/config.json` for you (task, resume, `use_plan`, `use_skills`). If you want to keep a hand-edited config, skip passing a task and edit `examples/config.json` directly.

### Tips for Effective Tasks

Good examples:
- "Open Edge, go to google.com, search for 'TuriX AI', and click the first result"
- "Open Settings, click on Personalization, then switch to Dark mode"
- "Open File Explorer, navigate to Documents, and create a new folder named 'Project X'"

Avoid:
- Vague instructions: "Help me" or "Fix this"
- Impossible actions: "Delete all files"
- Tasks requiring system-level permissions without warning

Best practices:
1. Be specific about the target application.
2. Break complex tasks into clear steps, but do not mention precise screen coordinates.

## Hotkeys

- Force Stop: `Ctrl+Shift+2` - Immediately stops the agent

## Monitoring and Logs

Logs are saved to `.turix_tmp/logging.log` in the project directory. Check this for:
- Step-by-step execution details
- LLM interactions and reasoning
- Errors and recovery attempts

## Important Notes

### How TuriX Runs
- TuriX can be started via OpenClaw `exec` with `pty:true` mode.
- The first launch takes 2-5 minutes to load all AI models (Brain, Actor, Planner, Memory).
- Background output is buffered; you may not see live progress until task completes or stops.

### Before Running
Always ensure PATH and environment are ready:
```powershell
# Example (adjust for your Conda install path)
$env:Path = "your_conda_dir;your_conda_dir\Scripts;$env:Path"
cd your_dir\TuriX-CUA
conda run -n turix_env python examples/main.py
```

Published package note:
- `your_dir` is a placeholder path in the shared version. Replace it with your own local TuriX project path before running.

Why? If `conda` is unavailable in PATH, the helper script cannot start TuriX.

### Checking if TuriX is Running
```powershell
# Check process by command line
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -match "python.*examples/main.py" } |
  Select-Object ProcessId, Name, CommandLine
```

Note: `.turix_tmp` may not be created until TuriX starts executing steps.

## Troubleshooting

### Common Issues

| Error | Solution |
|-------|----------|
| `NoneType has no attribute 'save'` | Screen capture or desktop session issue. Keep desktop unlocked and visible. |
| `uiautomation error` | Ensure `uiautomation` is installed and avoid privilege mismatch (admin app vs non-admin runner). |
| `Conda environment not found` | Ensure `turix_env` exists: `conda create -n turix_env python=3.12` |
| Module import errors | Activate environment: `conda activate turix_env` then `pip install -r requirements.txt` |
| Keyboard listener permission issues | Run terminal and target app at compatible privilege level. |

### Debug Mode

Logs include DEBUG level by default. Check:
```powershell
Get-Content -Wait your_dir\TuriX-CUA\.turix_tmp\logging.log
```

## Architecture

```
User Request
     v
[OpenClaw] -> [TuriX Skill] -> [run_turix.ps1] -> [TuriX Agent]
                                                   v
                    +------------------------------+------------------------------+
                    v                              v                              v
               [Planner]                      [Brain]                        [Memory]
                    v                              v                              v
                                              [Actor] ----> [Controller] ----> [Windows UI]
```

## Skill System Details

Skills are markdown files with YAML frontmatter in the `skills/` directory:

```md
---
name: skill-name
description: When to use this skill
---
# Skill Instructions
High-level workflow like: Open Edge, then go to Google.
```

The Planner selects relevant skills based on name/description; the Brain uses full content for step guidance.

## Advanced Options

| Option | Description |
|--------|-------------|
| `use_plan: true` | Enable planning for complex tasks |
| `use_skills: true` | Enable skill selection |
| `resume: true` | Resume from previous interruption |
| `max_steps: N` | Limit total steps (default: 100) |
| `max_actions_per_step: N` | Actions per step (default: 5) |
| `force_stop_hotkey` | Custom hotkey to stop agent |

---

## TuriX Skills System

TuriX supports Skills: markdown playbooks that help the agent behave more reliably in specific domains.

### 1. Built-in Skills

| Skill | Use |
|-------|-----|
| `github-web-actions` | GitHub web actions (search repos, star, etc.) |

### 2. Create a Custom Skill

Create a `.md` file in the TuriX project's `skills/` directory:

```md
---
name: my-custom-skill
description: When performing X specific task
---
# Custom Skill

## Guidelines
- Step 1: Do this first
- Step 2: Then do that
- Step 3: Verify the result
```

Field definitions:
- `name`: Skill identifier (used by the Planner to select)
- `description`: When to use this skill (Planner matches on this)
- Body below frontmatter: Full execution guide (used by the Brain)

### 3. Enable Skills

In `examples/config.json`:

```json
{
  "agent": {
    "use_plan": true,
    "use_skills": true,
    "skills_dir": "skills",
    "skills_max_chars": 4000
  }
}
```

### 4. Run a Task with Skills

```powershell
powershell -ExecutionPolicy Bypass -File "{baseDir}/scripts/run_turix.ps1" "Search for turix-cua on GitHub and star it"
```

The agent will automatically:
1. Planner reads the skill name and description.
2. Selects relevant skills.
3. Brain uses full skill content to guide execution.

### 5. Chinese Text Support

Background:
Passing Chinese text through shell interpolation can mangle UTF-8, and interpolating untrusted text is unsafe.

Solution:
The `run_turix.ps1` script writes config as UTF-8 and passes task text as normal PowerShell argument text.

Key points:
1. Always use UTF-8 when reading/writing config files.
2. Do not manually convert task text to escaped ASCII.
3. Prefer passing full task content as one quoted argument.

### 6. Document Creation Best Practices

Challenges:
- Asking TuriX to collect news, then create and send a document directly.
- TuriX is a GUI agent, so it can be slower and less deterministic.

Recommended approach: create the document yourself and let TuriX only send it.
1. Create the Word document with `python-docx`.
2. Let TuriX only send the file.

```python
from docx import Document
doc = Document()
doc.add_heading('Title')
doc.save('C:/path/to/file.docx')
```

Suggested workflow:
1. Use web tools to gather information.
2. Use Python to create the Word document.
3. Use TuriX to send the file. Specify the full file path.
4. If you really need TuriX to create a document manually, place structured guidance in TuriX skills.

### 7. Example: Add a New Skill

Create `skills/browser-tasks.md`:

```md
---
name: browser-tasks
description: When performing tasks in a web browser (search, navigate, fill forms).
---
# Browser Tasks

## Navigation
- Use the address bar or search box to navigate
- Open new tabs for each distinct task
- Wait for page to fully load before proceeding

## Forms
- Click on input fields to focus
- Type content clearly
- Look for submit/button to complete actions

## Safety
- Confirm before submitting forms
- Do not download files without user permission
```

### 8. Skill Development Tips

1. Be precise in the description - helps the Planner select correctly.
2. Make steps clear - the Brain needs explicit guidance.
3. Include safety checks - confirmations for important actions.
4. Keep it concise - recommended under 4000 characters per skill file.

---

## Monitoring and Debugging Guide

### 1. Run a Task

```powershell
# Run directly
powershell -ExecutionPolicy Bypass -File "{baseDir}/scripts/run_turix.ps1" "Your task description"

# Run in background
Start-Process powershell -ArgumentList "-ExecutionPolicy","Bypass","-File","{baseDir}/scripts/run_turix.ps1","Your task description"
```

### 2. Monitor Progress

Method 1: OpenClaw session/log view
```powershell
openclaw sessions --all-agents
openclaw logs --follow
```

Method 2: TuriX logs
```powershell
Get-Content -Wait your_dir\TuriX-CUA\.turix_tmp\logging.log
```

Method 3: Check processes
```powershell
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -match "python.*examples/main.py" }
```

Method 4: Check generated files
```powershell
Get-ChildItem your_dir\TuriX-CUA\.turix_tmp\*.txt
```

### 3. Log File Reference

| File | Description |
|------|-------------|
| `logging.log` | Main log file |
| `brain_llm_interactions.log_brain_N.txt` | Brain model conversations (one per step) |
| `actor_llm_interactions.log_actor_N.txt` | Actor model conversations (one per step) |

Key log markers:
- `Step N` - New step started
- `Eval: Success/Failed` - Current step evaluation
- `Goal to achieve this step` - Current goal
- `Action` - Executed action
- `Task completed successfully` - Task completed

### 4. Common Monitoring Issues

| Issue | Check |
|-------|-------|
| Process unresponsive | process list for `examples/main.py` |
| Stuck on step 1 | whether `.turix_tmp/` was created |
| Model loading is slow | first run can take 1-2 minutes |
| No log output | check `config.json` `logging_level` |

### 5. Force Stop

Hotkey: `Ctrl+Shift+2` - stop the agent immediately

Command:
```powershell
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -match "python.*examples/main.py" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

### 6. View Results

After completion, the agent will:
1. Create interaction logs in `.turix_tmp/`.
2. Create record files (if `record_info` is used).
3. Keep screenshots in memory for subsequent steps.

Example: view a summary file
```powershell
Get-Content your_dir\TuriX-CUA\.turix_tmp\latest_ai_news_summary_jan2026.txt
```

### 7. Debugging Tips

1. Inspect Brain reasoning: check `brain_llm_interactions.log_brain_*.txt` for `analysis` and `next_goal`.
2. Inspect Actor actions: check `actor_llm_interactions.log_actor_*.txt`.
3. Check screenshots: TuriX captures a screenshot each step (kept in memory).
4. Read record files: the agent uses `record_info` to save key info into `.txt` files.

### 8. Example Monitoring Flow

```powershell
# 1. Run a task
Start-Process powershell -ArgumentList "-ExecutionPolicy","Bypass","-File","{baseDir}/scripts/run_turix.ps1","Search AI news and summarize"

# 2. Wait and check process
Start-Sleep -Seconds 10
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match "examples/main.py" }

# 3. Check if logs are being created
Get-ChildItem your_dir\TuriX-CUA\.turix_tmp\

# 4. Tail progress in real time
Get-Content -Wait your_dir\TuriX-CUA\.turix_tmp\logging.log
```
