const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const taskRoutes = require("./routes/task");
console.log(taskRoutes);
app.use("/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
