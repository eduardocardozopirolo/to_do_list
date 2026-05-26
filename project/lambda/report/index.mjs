const completedStatuses = new Set([
  "completed",
  "complete",
  "done",
  "concluido",
  "concluida",
]);

const responseHeaders = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
};

function normalizeStatus(status) {
  return String(status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getTasksFromApiResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.tasks)) {
    return data.tasks;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export const handler = async () => {
  const tasksApiUrl = process.env.TASKS_API_URL;

  if (!tasksApiUrl) {
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({
        error: "TASKS_API_URL nao foi configurada na Lambda",
      }),
    };
  }

  try {
    const response = await fetch(tasksApiUrl, {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API retornou HTTP ${response.status}`);
    }

    const data = await response.json();
    const tasks = getTasksFromApiResponse(data);
    const total = tasks.length;
    const completed = tasks.filter((task) =>
      completedStatuses.has(normalizeStatus(task.status))
    ).length;
    const pending = total - completed;

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({
        total,
        completed,
        pending,
        generated_at: new Date().toISOString(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({
        error: "Erro ao gerar relatorio",
        detail: error.message,
      }),
    };
  }
};
