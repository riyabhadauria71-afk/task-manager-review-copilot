// test/tasks.test.js
// Minimal hand-rolled test runner so this project has zero dependencies.

const assert = require("assert");
const { addTask, completeTask, listTasks, resetTasks } = require("../src/tasks");

function test(name, fn) {
  resetTasks();
  try {
    fn();
    console.log(`  ok - ${name}`);
  } catch (err) {
    console.error(`  FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log("tasks.js");

test("addTask creates a task with default priority", () => {
  const task = addTask("Write ADR");
  assert.strictEqual(task.title, "Write ADR");
  assert.strictEqual(task.priority, "normal");
  assert.strictEqual(task.done, false);
});

test("addTask rejects an empty title", () => {
  assert.throws(() => addTask(""), /Task title is required/);
});

test("completeTask marks a task done", () => {
  const task = addTask("Ship feature");
  completeTask(task.id);
  assert.strictEqual(listTasks()[0].done, true);
});

test("completeTask throws for unknown id", () => {
  assert.throws(() => completeTask(999), /not found/);
});

test("listTasks can exclude completed tasks", () => {
  const a = addTask("A");
  addTask("B");
  completeTask(a.id);
  const open = listTasks({ includeDone: false });
  assert.strictEqual(open.length, 1);
  assert.strictEqual(open[0].title, "B");
});
