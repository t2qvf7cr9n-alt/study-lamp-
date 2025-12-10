console.log("✅ script.js has loaded successfully!");

// =====================================================
// ELEMENTS
// =====================================================
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const progressBarFill = document.getElementById("progressBarFill");
const lampFill = document.getElementById("lampFill");

let tasks = [];
let currentAlert = false;
let port, writer;

// =====================================================
// TASK FUNCTIONS
// =====================================================
function updateProgress() {
  if (tasks.length === 0) {
    progressBarFill.style.width = "0%";
    progressBarFill.textContent = "0%";
    lampFill.style.height = "0%";
    sendToLamp("P0");
    return;
  }

  const completed = tasks.filter(t => t.completed).length;
  const percent = Math.round((completed / tasks.length) * 100);

  progressBarFill.style.width = percent + "%";
  progressBarFill.textContent = percent + "%";
  lampFill.style.height = percent + "%";

  sendToLamp("P" + percent);
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";

    const leftSide = document.createElement("div");
    leftSide.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", () => {
      tasks[index].completed = checkbox.checked;
      renderTasks();
    });

    const span = document.createElement("span");
    span.textContent = task.name;

    leftSide.appendChild(checkbox);
    leftSide.appendChild(span);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      renderTasks();
    });

    li.appendChild(leftSide);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });

  updateProgress();
}

addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (text === "") return;
  tasks.push({ name: text, completed: false });
  taskInput.value = "";
  renderTasks();
});

taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTaskBtn.click();
});

renderTasks();

// =====================================================
// DISTRACTION HOOK
// =====================================================
function setDistracted(isDistracted) {
  currentAlert = isDistracted;

  if (isDistracted) {
    document.body.classList.add("distracted");
    lampFill.style.background = "#ff3b30";
    sendToLamp("A1");
  } else {
    document.body.classList.remove("distracted");
    lampFill.style.background = "#30d158";
    sendToLamp("A0");
  }
}

// =====================================================
// LAMP USB SERIAL CONNECTION
// =====================================================
async function connectLamp() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    writer = port.writable.getWriter();
    document.getElementById("lampStatus").textContent = "Connected";
  } catch (err) {
    console.error("Lamp connection failed:", err);
  }
}

async function sendToLamp(message) {
  if (!writer) return;
  await writer.write(new TextEncoder().encode(message + "\n"));
}

document.getElementById("connectLampBtn").onclick = connectLamp;

// ===========================================================
// PHONE DETECTION MODEL (Teachable Machine)
// ===========================================================
console.log("📱 Reached phone detection section");

const modelURL = "model/model.json";
const metadataURL = "model/metadata.json";

let tmModel, webcam;

// ===========================================================
// MAIN FUNCTION
// ===========================================================
async function initPhoneDetection() {
  console.log("Preparing to start phone detection...");

  // --- TEMP CAMERA TEST ---
  console.log("🎥 Directly testing browser webcam...");
  try {
    const videoElement = document.getElementById("webcam");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    console.log("✅ Camera stream attached directly to video element.");
  } catch (err) {
    console.error("❌ Camera access failed:", err);
  }

  // --- LOAD MODEL ---
  try {
    tmModel = await tmImage.load(modelURL, metadataURL);
    console.log("✅ Model loaded!");
    document.getElementById("trackingStatus").textContent = "Tracking active";
  } catch (err) {
    console.error("❌ Model failed to load:", err);
  }
}

// ===========================================================
// AUTO-START WHEN PAGE LOADS
// ===========================================================
window.addEventListener("DOMContentLoaded", initPhoneDetection);
window.setDistracted = setDistracted;
