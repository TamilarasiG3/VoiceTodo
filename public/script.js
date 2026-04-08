// Load tasks
async function loadTasks() {
  const res = await fetch("/tasks");
  const tasks = await res.json();

  const list = document.getElementById("tasks");
  list.innerHTML = "";

  tasks.forEach(t => {
    let text = t.text;

    if (t.date) text += ` 📅 ${t.date}`;
    if (t.time) text += ` ⏰ ${t.time}`;

    const li = document.createElement("li");
    li.innerText = text;
    list.appendChild(li);
  });
}

loadTasks();

// Voice Recognition
function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-IN";

  recognition.start();

  recognition.onresult = async function(event) {
    const text = event.results[0][0].transcript;
    document.getElementById("output").innerText = text;

    const taskData = parseTask(text);

    await fetch("/task", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(taskData)
    });

    loadTasks();
  };
}

// AI Parsing
function parseTask(text) {
  let date = null;
  let time = null;

  const lower = text.toLowerCase();

  // Tomorrow
  if (lower.includes("tomorrow")) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    date = d.toISOString().split("T")[0];
  }

  // Time (5pm)
  const match = lower.match(/(\d{1,2})(am|pm)/);
  if (match) {
    let hour = parseInt(match[1]);
    if (match[2] === "pm" && hour !== 12) hour += 12;
    time = `${hour}:00`;
  }

  return { text, date, time };
}

// 🔔 Notifications (ONLY FRONTEND)
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Check every 30 sec
setInterval(checkReminders, 30000);

async function checkReminders() {
  const res = await fetch("/tasks");
  const tasks = await res.json();

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const hour = now.getHours();

  tasks.forEach(t => {
    if (t.date === today && t.time) {
      const taskHour = parseInt(t.time.split(":")[0]);

      if (taskHour === hour) {
        new Notification("⏰ Reminder", {
          body: t.text
        });
      }
    }
  });
}