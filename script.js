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
