#!/usr/bin/env node
/**
 * 轻量任务队列（JSON 文件）：供 team-lead 在失败后手工/半自动重排队（测试报告 08 对齐）。
 * 不替代宿主调度；与 BookWorkflowOrchestrator.retryable 语义互补。
 *
 * 队列文件：.fbs/task-queue.json
 *
 * 用法：
 *   node integration/task-queue-helper.mjs --book-root <根> list
 *   node integration/task-queue-helper.mjs --book-root <根> enqueue --chapter ch05 --type chapter_write --payload '{"note":"..."}'
 *   node integration/task-queue-helper.mjs --book-root <根> complete --task-id <taskUuid>
 *   node integration/task-queue-helper.mjs --book-root <根> fail --task-id <taskUuid> --message "timeout"
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

function parseArgs(argv) {
  const o = {
    bookRoot: null,
    cmd: null,
    taskId: null,
    chapter: null,
    type: null,
    payload: null,
    message: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--book-root") o.bookRoot = argv[++i];
    else if (a === "--task-id") o.taskId = argv[++i];
    else if (a === "--chapter") o.chapter = argv[++i];
    else if (a === "--type") o.type = argv[++i];
    else if (a === "--payload") o.payload = argv[++i];
    else if (a === "--message") o.message = argv[++i];
    else if (!a.startsWith("-") && !o.cmd) o.cmd = a;
  }
  return o;
}

function queuePath(bookRoot) {
  return path.join(bookRoot, ".fbs", "task-queue.json");
}

function load(bookRoot) {
  const p = queuePath(bookRoot);
  if (!fs.existsSync(p)) {
    return { version: 1, tasks: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return { version: 1, tasks: [], _corrupt: true };
  }
}

function save(bookRoot, j) {
  const p = queuePath(bookRoot);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.bookRoot || !args.cmd) {
    console.error(
      "用法: node integration/task-queue-helper.mjs --book-root <根> list|enqueue|complete|fail ..."
    );
    process.exit(2);
  }
  const root = path.resolve(args.bookRoot);
  const j = load(root);

  if (args.cmd === "list") {
    console.log(JSON.stringify(j.tasks, null, 2));
    process.exit(0);
  }

  if (args.cmd === "enqueue") {
    const id = crypto.randomUUID();
    const task = {
      id,
      chapterOrTaskId: args.chapter || null,
      type: args.type || "unknown",
      status: "queued",
      retryCount: 0,
      maxRetries: 3,
      payload: args.payload ? JSON.parse(args.payload) : {},
      createdAt: new Date().toISOString(),
    };
    j.tasks.push(task);
    save(root, j);
    console.log("enqueued:", id);
    process.exit(0);
  }

  if (args.cmd === "complete" || args.cmd === "fail") {
    const tid = args.taskId;
    if (!tid) {
      console.error("需要 --task-id <taskUuid>");
      process.exit(2);
    }
    const t = j.tasks.find((x) => x.id === tid);
    if (!t) {
      console.error("task not found:", tid);
      process.exit(1);
    }
    if (args.cmd === "complete") {
      t.status = "completed";
      t.completedAt = new Date().toISOString();
    } else {
      t.status = "failed";
      t.lastError = args.message || "failed";
      t.retryCount = (t.retryCount || 0) + 1;
      if (t.retryCount < (t.maxRetries ?? 3)) {
        t.status = "queued";
        t.requeuedAt = new Date().toISOString();
      }
    }
    save(root, j);
    console.log("updated:", tid, t.status);
    process.exit(0);
  }

  console.error("未知命令:", args.cmd);
  process.exit(2);
}

main();
