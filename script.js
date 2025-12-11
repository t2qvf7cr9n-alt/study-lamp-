console.log("✅ script.js has loaded successfully!");

let tmImage = window.tmImage;

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

// =====================================================
// BLUETOOTH VARIABLES
// =====================================================
let bluetoothDevice;
let bluetoothCharacteristic;


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

window.setDistracted = setDistracted;


// =====================================================
// BLUETOOTH CONNECTION (REPLACES USB SERIAL)
// =====================================================
async function connectLamp() {
  try {
    console.log("🔵 Requesting Bluetooth Device...");

    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"]
    });

    console.log("🔵 Connecting...");
    const server = await bluetoothDevice.gatt.connect();

    const service = await server.getPrimaryService("0000ffe0-0000-1000-8000-00805f9b34fb");
    bluetoothCharacteristic = await service.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb");

    document.getElementById("lampStatus").textContent = "Connected via Bluetooth";
    console.log("✅ Bluetooth connected!");

  } catch (error) {
    console.error("❌ Bluetooth connection failed:", error);
  }
}

async function sendToLamp(message) {
  if (!bluetoothCharacteristic) return;

  let encoder = new TextEncoder();
  await bluetoothCharacteristic.writeValue(encoder.encode(message));
  console.log("📤 Sent to lamp:", message);
}

document.getElementById("connectLampBtn").onclick = connectLamp;


// ===========================================================
// PHONE DETECTION MODEL
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

  // Load model library
  if (!window.tmImage) {
    console.error("❌ tmImage library missing.");
    return;
  } else {
    tmImage = window.tmImage;
  }

  // TEMP CAMERA TEST
  try {
    console.log("🎥 Testing webcam...");
    const video = document.getElementById("webcam");
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("✅ Webcam working");
  } catch (err) {
    console.error("❌ Webcam failed:", err);
  }

  // Load model
  try {
    tmModel = await tmImage.load(modelURL, metadataURL);
    document.getElementById("trackingStatus").textContent = "Tracking Active";
    console.log("✅ Model loaded");
  } catch (err) {
    console.error("❌ Model failed to load:", err);
  }
}


// ===========================================================
// AUTO-START
// ===========================================================
window.addEventListener("DOMContentLoaded", initPhoneDetection);
