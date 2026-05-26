const DEFAULT_API_BASE_URL = "http://98.82.185.83:3000";
const COMPLETED_STATUSES = new Set(["completed", "complete", "done", "concluido", "concluida"]);

const elements = {
  apiBaseUrl: document.querySelector("#apiBaseUrl"),
  reportUrl: document.querySelector("#reportUrl"),
  saveConfigButton: document.querySelector("#saveConfigButton"),
  refreshButton: document.querySelector("#refreshButton"),
  connectionStatus: document.querySelector("#connectionStatus"),
  taskForm: document.querySelector("#taskForm"),
  taskId: document.querySelector("#taskId"),
  title: document.querySelector("#title"),
  description: document.querySelector("#description"),
  status: document.querySelector("#status"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  totalCount: document.querySelector("#totalCount"),
  completedCount: document.querySelector("#completedCount"),
  pendingCount: document.querySelector("#pendingCount"),
  tasksTableBody: document.querySelector("#tasksTableBody"),
  emptyState: document.querySelector("#emptyState"),
  lastUpdate: document.querySelector("#lastUpdate"),
};

let tasks = [];

function normalizeStatus(status) {
  return String(status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isCompleted(status) {
  return COMPLETED_STATUSES.has(normalizeStatus(status));
}

function getConfig() {
  const apiBaseUrl = elements.apiBaseUrl.value.trim().replace(/\/$/, "");
  const reportUrl = elements.reportUrl.value.trim();

  return {
    apiBaseUrl,
    tasksUrl: `${apiBaseUrl}/tasks`,
    reportUrl: reportUrl || `${apiBaseUrl}/report`,
  };
}

function saveConfig() {
  localStorage.setItem("todoAws.apiBaseUrl", elements.apiBaseUrl.value.trim());
  localStorage.setItem("todoAws.reportUrl", elements.reportUrl.value.trim());
  setStatus("URLs salvas.", "success");
}

function loadConfig() {
  elements.apiBaseUrl.value = localStorage.getItem("todoAws.apiBaseUrl") || DEFAULT_API_BASE_URL;
  elements.reportUrl.value = localStorage.getItem("todoAws.reportUrl") || "";
}

function setStatus(message, type = "default") {
  elements.connectionStatus.textContent = message;
  elements.connectionStatus.classList.toggle("is-error", type === "error");
  elements.connectionStatus.classList.toggle("is-success", type === "success");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

async function requestJson(url, options = {}) {
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.error || `HTTP ${response.status}`);
  }

  return data;
}

async function loadReport() {
  const { reportUrl } = getConfig();

  try {
    const report = await requestJson(reportUrl);
    const body = typeof report.body === "string" ? JSON.parse(report.body) : report;

    if (typeof body.total === "number") {
      elements.totalCount.textContent = body.total;
      elements.completedCount.textContent = body.completed ?? 0;
      elements.pendingCount.textContent = body.pending ?? 0;
      return;
    }
  } catch {
    updateSummaryFromTasks();
  }
}

function updateSummaryFromTasks() {
  const total = tasks.length;
  const completed = tasks.filter((task) => isCompleted(task.status)).length;

  elements.totalCount.textContent = total;
  elements.completedCount.textContent = completed;
  elements.pendingCount.textContent = total - completed;
}

function renderTasks() {
  elements.tasksTableBody.innerHTML = "";
  elements.emptyState.hidden = tasks.length > 0;

  for (const task of tasks) {
    const row = document.createElement("tr");
    const completed = isCompleted(task.status);

    row.innerHTML = `
      <td>${task.id}</td>
      <td><strong>${escapeHtml(task.title || "")}</strong></td>
      <td class="description-cell">${escapeHtml(task.description || "-")}</td>
      <td><span class="status-pill ${completed ? "completed" : "pending"}">${completed ? "Concluida" : "Pendente"}</span></td>
      <td>${formatDate(task.created_at)}</td>
      <td>
        <div class="row-actions">
          <button class="ghost-button" type="button" data-action="edit" data-id="${task.id}">Editar</button>
          <button class="secondary-button" type="button" data-action="complete" data-id="${task.id}">Concluir</button>
          <button class="danger-button" type="button" data-action="delete" data-id="${task.id}">Excluir</button>
        </div>
      </td>
    `;

    elements.tasksTableBody.appendChild(row);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadTasks() {
  const { tasksUrl } = getConfig();
  setStatus("Carregando tarefas...");

  tasks = await requestJson(tasksUrl);
  renderTasks();
  updateSummaryFromTasks();
  await loadReport();

  elements.lastUpdate.textContent = `Atualizado em ${formatDate(new Date().toISOString())}`;
  setStatus("Conectado com sucesso.", "success");
}

async function saveTask(event) {
  event.preventDefault();

  const { tasksUrl } = getConfig();
  const id = elements.taskId.value;
  const task = {
    title: elements.title.value.trim(),
    description: elements.description.value.trim(),
    status: elements.status.value,
  };

  if (!task.title) {
    setStatus("Informe o titulo da tarefa.", "error");
    return;
  }

  const url = id ? `${tasksUrl}/${id}` : tasksUrl;
  const method = id ? "PUT" : "POST";

  await requestJson(url, {
    method,
    body: JSON.stringify(task),
  });

  resetForm();
  await loadTasks();
  setStatus(id ? "Tarefa atualizada." : "Tarefa criada.", "success");
}

function editTask(id) {
  const task = tasks.find((item) => String(item.id) === String(id));
  if (!task) {
    return;
  }

  elements.taskId.value = task.id;
  elements.title.value = task.title || "";
  elements.description.value = task.description || "";
  elements.status.value = isCompleted(task.status) ? "completed" : "pending";
  document.querySelector("#formTitle").textContent = "Editar tarefa";
  elements.title.focus();
}

async function completeTask(id) {
  const task = tasks.find((item) => String(item.id) === String(id));
  if (!task) {
    return;
  }

  const { tasksUrl } = getConfig();
  await requestJson(`${tasksUrl}/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      status: "completed",
    }),
  });

  await loadTasks();
  setStatus("Tarefa marcada como concluida.", "success");
}

async function deleteTask(id) {
  const confirmed = window.confirm("Deseja excluir esta tarefa?");
  if (!confirmed) {
    return;
  }

  const { tasksUrl } = getConfig();
  await requestJson(`${tasksUrl}/${id}`, { method: "DELETE" });
  await loadTasks();
  setStatus("Tarefa excluida.", "success");
}

function resetForm() {
  elements.taskForm.reset();
  elements.taskId.value = "";
  document.querySelector("#formTitle").textContent = "Cadastrar tarefa";
}

async function handleAsync(action) {
  try {
    await action();
  } catch (error) {
    setStatus(error.message, "error");
  }
}

elements.saveConfigButton.addEventListener("click", () => {
  saveConfig();
  handleAsync(loadTasks);
});

elements.refreshButton.addEventListener("click", () => handleAsync(loadTasks));
elements.taskForm.addEventListener("submit", (event) => handleAsync(() => saveTask(event)));
elements.cancelEditButton.addEventListener("click", resetForm);

elements.tasksTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;

  if (action === "edit") {
    editTask(id);
  }

  if (action === "complete") {
    handleAsync(() => completeTask(id));
  }

  if (action === "delete") {
    handleAsync(() => deleteTask(id));
  }
});

loadConfig();
handleAsync(loadTasks);
