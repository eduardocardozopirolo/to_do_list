const express = require("express");
const router = express.Router();
const pool = require("../db");

function handleError(res, error) {
  console.error("Database error:", error);
  res.status(500).json({
    error: "Erro ao acessar o banco de dados",
    detail: error.message,
  });
}

// GET /tasks
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    handleError(res, error);
  }
});

// POST /tasks
router.post("/", async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const result = await pool.query(
      "INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *",
      [title, description, status]
    );

    res.json(result.rows[0]);
  } catch (error) {
    handleError(res, error);
  }
});

// PUT /tasks/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const result = await pool.query(
      "UPDATE tasks SET title=$1, description=$2, status=$3 WHERE id=$4 RETURNING *",
      [title, description, status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE /tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM tasks WHERE id=$1", [id]);

    res.json({ message: "Task deletada" });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
