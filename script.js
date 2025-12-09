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

/****************************************************
 * PHONE DETECTION PLACEHOLDER (MODEL GOES HERE)
 * --------------------------------------------------
 * This section sets up the webcam and a detection loop.
 * Your teammate will later insert their ML model into
 * the "runDetection()" function.
 ****************************************************/

// Create a video element for webcam feed
const phoneCam = document.createElement("video");
phoneCam.setAttribute("autoplay", true);
phoneCam.setAttribute("playsinline", true);  // important for some browsers
phoneCam.style.display = "none";             // hide the video element
document.body.appendChild(phoneCam);

// Start webcam stream
async function startWebcamFeed() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        phoneCam.srcObject = stream;
        console.log("Webcam started for phone detection.");
    } catch (err) {
        console.error("Error starting webcam:", err);
    }
}

// Placeholder: this function will be replaced by the REAL model code
async function runDetection() {
    /*******************************************
     * THIS IS WHERE THE PHONE MODEL GOES LATER
     *
     * Example for teammate to fill in:
     * const predictions = await model.detect(phoneCam);
     * let phoneFound = predictions.some(p => p.class === "cell phone");
     *******************************************/
    
    // 🔥 TEMP LOGIC (always false until model is added)
    let phoneFound = false;

    // Call your existing distraction function
    if (phoneFound) {
        setDistracted(true);
    } else {
        setDistracted(false);
    }

    // Loop again on next video frame
    requestAnimationFrame(runDetection);
}

// Start everything
async function startPhoneDetection() {
    await startWebcamFeed();   // start webcam first
    runDetection();            // then start calling detection every frame
}

startPhoneDetection();


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
