// src/tasks.js
// In-memory task manager. See docs/adr/0001-in-memory-store.md for why
// this doesn't use a database yet.

let tasks = [];
let nextId = 1;

function addTask(title, priority = "normal") {
  if (!title || typeof title !== "string") {
    throw new Error("Task title is required and must be a string");
  }
  const task = {
    id: nextId++,
    title,
    priority,
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

function completeTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    throw new Error(`Task ${id} not found`);
  }
  task.done = true;
  return task;
}

function listTasks({ includeDone = true, priority } = {}) {
  let result = includeDone ? tasks : tasks.filter((t) => !t.done);
  if (priority !== undefined) {
    result = result.filter((t) => t.priority === priority);
  }
  return result;
}

function resetTasks() {
  tasks = [];
  nextId = 1;
}

// Quick and dirty persistence so tasks survive a restart during demos.
const fs = require("fs");
function saveToFile(path = "tasks.json") {
  fs.writeFileSync(path, JSON.stringify(tasks));
}

module.exports = { addTask, completeTask, listTasks, resetTasks, saveToFile };
