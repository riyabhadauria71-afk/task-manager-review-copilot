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
let reviewData = null;
let activeTag = null;

async function loadReview() {
  if (reviewLoaded) return;
  reviewLoaded = true;

  const res = await fetch("/api/review");
  reviewData = await res.json();

  document.getElementById("review-meta").textContent =
    `${reviewData.branch} → ${reviewData.base}  ·  reviewed by ${reviewData.generatedBy}  ·  ${reviewData.timeToReview}`;

  const autofixList = document.getElementById("review-autofix");
  autofixList.innerHTML = "";
  for (const fix of reviewData.autoFixable) {
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

  document.getElementById("review-resolution").textContent = reviewData.resolution;

  renderReview();
}

function setActiveTag(tag) {
  activeTag = activeTag === tag ? null : tag;
  renderReview();
}

function renderReview() {
  if (!reviewData) return;

  const filteredBlockers = activeTag
    ? reviewData.blockers.filter((f) => f.tags.includes(activeTag))
    : reviewData.blockers;
  const filteredNotes = activeTag
    ? reviewData.notes.filter((f) => f.tags.includes(activeTag))
    : reviewData.notes;

  const summaryEl = document.getElementById("review-summary");
  summaryEl.innerHTML = "";
  const summaryText = document.createElement("span");
  summaryText.textContent = activeTag
    ? `Filtered to ${activeTag}: ${filteredBlockers.length} blockers, ${filteredNotes.length} notes.`
    : `${reviewData.blockers.length} blockers, ${reviewData.notes.length} notes. ${reviewData.autoFixable.filter((f) => f.applied).length} of ${reviewData.autoFixable.length} mechanical fixes applied.`;
  summaryEl.appendChild(summaryText);

  if (activeTag) {
    const clearBtn = document.createElement("button");
    clearBtn.className = "clear-filter-btn";
    clearBtn.textContent = "Clear filter ×";
    clearBtn.addEventListener("click", () => setActiveTag(activeTag));
    summaryEl.appendChild(clearBtn);
  }

  renderFindingList("review-blockers", filteredBlockers);
  renderFindingList("review-notes", filteredNotes);
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
      if (t === activeTag) tag.classList.add("is-active");
      tag.title = `Filter by ${t}`;
      tag.addEventListener("click", () => setActiveTag(t));
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

  if (findings.length === 0) {
    const empty = document.createElement("li");
    empty.className = "finding-empty";
    empty.textContent = "No findings with this tag.";
    el.appendChild(empty);
  }
}

// --- init ---

loadTasks();
