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

function listTasks({ includeDone = true } = {}) {
  return includeDone ? tasks : tasks.filter((t) => !t.done);
}

function resetTasks() {
  tasks = [];
  nextId = 1;
}

module.exports = { addTask, completeTask, listTasks, resetTasks };
