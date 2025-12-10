window.addEventListener("load", async () => {
  const tmImage = window.tmImage;

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
const modelURL = "model/model.json";
const metadataURL = "model/metadata.json";

let tmModel, webcam;

async function initPhoneDetection() {
  try {
    // Load the Teachable Machine model
    tmModel = await tmImage.load(modelURL, metadataURL);
    console.log("Model loaded!");

    // Update status text
    document.getElementById("trackingStatus").textContent = "Tracking active";

    // Initialize webcam
    webcam = new tmImage.Webcam(300, 300, true); // width, height, flip
    await webcam.setup(); // request permission
    await webcam.play(); // start camera

    // ✅ Display webcam feed
    document.getElementById("webcam").srcObject = webcam.stream;

    // ✅ Start detection loop
    window.requestAnimationFrame(detectionLoop);

  } catch (err) {
    console.error("Model or webcam failed to load:", err);
    document.getElementById("trackingStatus").textContent = "Tracking error";
  }
}

async function detectionLoop() {
  webcam.update(); // get new frame
  await predictPhonePresence();
  window.requestAnimationFrame(detectionLoop);
}

async function predictPhonePresence() {
  if (!tmModel) return;

  const predictions = await tmModel.predict(webcam.canvas);
  const holdingPhoneProb = predictions[0].probability;
  const textBox = document.getElementById("predictionText");

  if (holdingPhoneProb > 0.85) {
    textBox.textContent = "📱 Phone detected!";
    setDistracted(true);
  } else {
    textBox.textContent = "✔ No phone detected";
    setDistracted(false);
  }
}

// ✅ Start tracking once everything is ready
window.addEventListener("DOMContentLoaded", initPhoneDetection);

  window.setDistracted = setDistracted;
});
