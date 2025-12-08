const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const progressBarFill = document.getElementById('progressBarFill');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateProgress() {
    if (tasks.length === 0) {
        progressBarFill.style.width = '0%';
        progressBarFill.textContent = '0%';
        return;
    }
    const completed = tasks.filter(t => t.completed).length;
    const percent = Math.round((completed / tasks.length) * 100);
    progressBarFill.style.width = percent + '%';
    progressBarFill.textContent = percent + '%';
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            tasks[index].completed = checkbox.checked;
            saveTasks();
            updateProgress();
        });

        const span = document.createElement('span');
        span.textContent = task.name;

        li.appendChild(checkbox);
        li.appendChild(span);
        taskList.appendChild(li);
    });
    updateProgress();
}

addTaskBtn.addEventListener('click', () => {
    const taskName = taskInput.value.trim();
    if (taskName === '') return;
    tasks.push({ name: taskName, completed: false });
    taskInput.value = '';
    saveTasks();
    renderTasks();
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTaskBtn.click();
});

renderTasks();
