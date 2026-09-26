// frontend/app.js

// --- tab switching ---

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("is-active"));

    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("is-active");

    if (tab.dataset.tab === "review") loadReview();
  });
});

// --- task manager ---

const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskPrioritySelect = document.getElementById("task-priority");
const priorityFilter = document.getElementById("priority-filter");
const taskList = document.getElementById("task-list");
const taskEmpty = document.getElementById("task-empty");

async function loadTasks() {
  const priority = priorityFilter.value;
  const qs = priority ? `?priority=${encodeURIComponent(priority)}` : "";
  const res = await fetch(`/api/tasks${qs}`);
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  taskEmpty.hidden = tasks.length > 0;

  for (const task of tasks) {
    const li = document.createElement("li");
    if (task.done) li.classList.add("done");

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const badge = document.createElement("span");
    badge.className = "priority-badge";
    badge.dataset.priority = task.priority;
    badge.textContent = task.priority;

    li.appendChild(title);
    li.appendChild(badge);

    if (!task.done) {
      const btn = document.createElement("button");
      btn.className = "complete-btn";
      btn.textContent = "Complete";
      btn.addEventListener("click", async () => {
        await fetch(`/api/tasks/${task.id}/complete`, { method: "POST" });
        loadTasks();
      });
      li.appendChild(btn);
    }

    taskList.appendChild(li);
  }
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title) return;

  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, priority: taskPrioritySelect.value }),
  });

  taskTitleInput.value = "";
  loadTasks();
});

priorityFilter.addEventListener("change", loadTasks);

// --- review findings ---

let reviewLoaded = false;

async function loadReview() {
  if (reviewLoaded) return;
  reviewLoaded = true;

  const res = await fetch("/api/review");
  const data = await res.json();

  document.getElementById("review-meta").textContent =
    `${data.branch} → ${data.base}  ·  reviewed by ${data.generatedBy}  ·  ${data.timeToReview}`;

  document.getElementById("review-summary").textContent =
    `${data.blockers.length} blockers, ${data.notes.length} notes. ${data.autoFixable.filter((f) => f.applied).length} of ${data.autoFixable.length} mechanical fixes applied.`;

  renderFindingList("review-blockers", data.blockers);
  renderFindingList("review-notes", data.notes);

  const autofixList = document.getElementById("review-autofix");
  autofixList.innerHTML = "";
  for (const fix of data.autoFixable) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = `${fix.id} — ${fix.title}`;
    const status = document.createElement("span");
    status.className = "autofix-applied";
    status.textContent = fix.applied ? "applied" : "pending";
    li.appendChild(label);
    li.appendChild(status);
    autofixList.appendChild(li);
  }

  document.getElementById("review-resolution").textContent = data.resolution;
}

function renderFindingList(elementId, findings) {
  const el = document.getElementById(elementId);
  el.innerHTML = "";
  for (const finding of findings) {
    const li = document.createElement("li");

    const tags = document.createElement("div");
    tags.className = "finding-tags";
    for (const t of finding.tags) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.dataset.tag = t;
      tag.textContent = t;
      tags.appendChild(tag);
    }

    const title = document.createElement("div");
    title.className = "finding-title";
    title.textContent = `#${finding.id} — ${finding.title}`;

    const detail = document.createElement("div");
    detail.className = "finding-detail";
    detail.textContent = finding.detail;

    li.appendChild(tags);
    li.appendChild(title);
    li.appendChild(detail);
    el.appendChild(li);
  }
}

// --- init ---

loadTasks();
