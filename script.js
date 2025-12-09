// Elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const progressBarFill = document.getElementById("progressBarFill");
const lampFill = document.getElementById("lampFill");

let tasks = [];
let currentAlert = false;
let port, writer;

// ---------------------------
// TASK FUNCTIONS
// ---------------------------

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

// ---------------------------
// DISTRACTION HOOK
// ---------------------------

function setDistracted(isDistracted) {
    currentAlert = isDistracted;

    if (isDistracted) {
        document.body.classList.add("distracted");
        sendToLamp("A1");
        lampFill.style.background = "#ff3b30";
    } else {
        document.body.classList.remove("distracted");
        sendToLamp("A0");
        lampFill.style.background = "#30d158";
    }
}

// ---------------------------
// LAMP CONNECTION (USB Serial)
// ---------------------------

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

/* ===========================================================
   PHONE DETECTION MODEL (Teachable Machine)
   =========================================================== */

// IMPORTANT: these paths must match your GitHub folder names EXACTLY
const modelURL = "hand tracking model/my_model/model.json";
const metadataURL = "hand tracking model/my_model/metadata.json";

// Global model + webcam objects
let tmModel, maxPredictions, webcam;

async function initPhoneDetection() {
    try {
        // Load Teachable Machine model
        tmModel = await tmImage.load(modelURL, metadataURL);
        maxPredictions = tmModel.getTotalClasses();
        console.log("Model loaded:", maxPredictions, "classes");

        // Setup webcam
        const flip = true;
        webcam = new tmImage.Webcam(300, 300, flip);
        await webcam.setup();
        await webcam.play();

        // Display webcam in HTML <video>
        document.getElementById("webcam").srcObject = webcam.webcam;

        // Start detection loop
        window.requestAnimationFrame(detectionLoop);

        document.getElementById("trackingStatus").textContent = "Tracking active";
    } catch (err) {
        console.error("Model loading/tracking failed:", err);
        document.getElementById("trackingStatus").textContent = "Tracking error";
    }
}

async function detectionLoop() {
    webcam.update();
    await predictPhonePresence();
    window.requestAnimationFrame(detectionLoop);
}

async function predictPhonePresence() {
    if (!tmModel) return;

    const predictions = await tmModel.predict(webcam.canvas);

    // According to metadata:
    // Class 0: "Holding Phone"
    // Class 1: "Not holding phone"
    const holdingP

async function predictPhonePresence() {
    if (!tmModel) return;

    const predictions = await tmModel.predict(webcam.canvas);

    // According to metadata:
    // Class 0: "Holding Phone"
    // Class 1: "Not holding phone"
    const holdingPhoneProb = predictions[0].probability;
    const notHoldingProb = predictions[1].probability;

    const textBox = document.getElementById("predictionText");

    if (holdingPhoneProb > 0.85) {
        textBox.textContent = "📱 Phone detected!";
        setDistracted(true);
    } else {
        textBox.textContent = "✔ No phone detected";
        setDistracted(false);
    }
}

// Start tracking once page is loaded
window.addEventListener("DOMContentLoaded", () => {
    initPhoneDetection();
});
