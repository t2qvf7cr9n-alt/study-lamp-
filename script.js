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
        leftSide.appendChil

/* ===========================================================
   PHONE DETECTION MODEL (Teachable Machine)
   =========================================================== */

// Correct file paths based on your GitHub folder:
const modelURL = "hand_tracking_model/my_model/model.json";
const metadataURL = "hand_tracking_model/my_model/metadata.json";

let tmModel, webcam;

// Start the phone detection system
async function initPhoneDetection() {
    try {
        // Load Teachable Machine model
        tmModel = await tmImage.load(modelURL, metadataURL);
        console.log("Model loaded!");

        // Update status text
        document.getElementById("trackingStatus").textContent = "Tracking active";

        // Setup webcam
        webcam = new tmImage.Webcam(300, 300, true);
        await webcam.setup(); 
        await webcam.play();

        // Display webcam feed inside your <video> tag
        document.getElementById("webcam").srcObject = webcam.webcam;

        // Begin prediction loop
        window.requestAnimationFrame(detectionLoop);

    } catch (err) {
        console.error("Error loading model:", err);
        document.getElementById("trackingStatus").textContent = "Model failed to load";
    }
}

async function detectionLoop() {
    webcam.update();
    await predictPhonePresence();
    window.requestAnimationFrame(detectionLoop);
}

async function predictPhonePresence() {
    if (!tmModel) return;

    // Run prediction on webcam feed
    const predictions = await tmModel.predict(webcam.canvas);

    // Class definitions from your training
    const holdingPhoneProb = predictions[0].probability;
    const textBox = document.getElementById("predictionText");

    // Trigger distraction state
    if (holdingPhoneProb > 0.85) {
        textBox.textContent = "📱 Phone detected!";
        setDistracted(true);
    } else {
        textBox.textContent = "✔ No phone detected";
        setDistracted(false);
    }
}

// Start tracking system when page is ready
window.addEventListener("DOMContentLoaded", initPhoneDetection);
