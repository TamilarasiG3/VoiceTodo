const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const DB_FILE = "db.json";

// Read DB
function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

// Write DB
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Add Task
app.post("/task", (req, res) => {
  const db = readDB();

  db.tasks.push({
    text: req.body.text,
    date: req.body.date,
    time: req.body.time
  });

  writeDB(db);
  res.json({ message: "Task saved" });
});

// Get Tasks
app.get("/tasks", (req, res) => {
  const db = readDB();
  res.json(db.tasks);
});

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});