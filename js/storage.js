// --- main functions ---

function clearBoard() {
    document.querySelectorAll(".tasks").forEach(container => container.innerHTML = "");
}

function createTask(text, container) {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task";
    taskDiv.innerHTML = `
        <button class="move-left"><img src="./arrow.svg" width="20" height="20"></button>
        <div class="task-text">${text}</div>
        <button class="move-right"><img src="./arrow.svg" width="20" height="20"></button>
    `;
    container.appendChild(taskDiv);
    
    if (typeof taskButtons === 'function') {
        taskButtons(taskDiv);
    }
}

function saveTasks(userName) {
    if (!userName) return;

    const data = {
        todo: Array.from(document.querySelector(".todo-section .tasks").children)
            .map(t => t.querySelector(".task-text").textContent),
        progress: Array.from(document.querySelector(".in-progress-section .tasks").children)
            .map(t => t.querySelector(".task-text").textContent),
        done: Array.from(document.querySelector(".done-section .tasks").children)
            .map(t => t.querySelector(".task-text").textContent)
    };
    localStorage.setItem(`kanbanTasks_${userName}`, JSON.stringify(data));
}

function loadTasks(userName) {
    const data = JSON.parse(localStorage.getItem(`kanbanTasks_${userName}`));
    if (!data) return;

  clearBoard();
  
    const containers = {
        todo: document.querySelector(".todo-section .tasks"),
        progress: document.querySelector(".in-progress-section .tasks"),
        done: document.querySelector(".done-section .tasks")
    };

    data.todo.forEach(text => createTask(text, containers.todo));
    data.progress.forEach(text => createTask(text, containers.progress));
    data.done.forEach(text => createTask(text, containers.done));
}

function showLoginForm() {
    document.getElementById("kanban-section").classList.add("hidden");
    document.getElementById("logout-btn").classList.add("hidden");
    document.getElementById("registration-btn").classList.remove("hidden");
    document.getElementById("login-btn").classList.remove("hidden");
}

function showKanban() {
    document.getElementById("kanban-section").classList.remove("hidden");
    document.getElementById("logout-btn").classList.remove("hidden");
    document.getElementById("registration-btn").classList.add("hidden");
    document.getElementById("login-btn").classList.add("hidden");
}

// --- initialization ---

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = localStorage.getItem("user");

    if (currentUser) {
        showKanban();
        loadTasks(currentUser);
    } else {
        showLoginForm();
    }

    document.getElementById("registerBtn").onclick = (e) => {
        e.preventDefault();
        const name = document.getElementById("regName").value.trim();
        if (name) {
            const user = { 
                name, 
                email: document.getElementById("regEmail").value, 
                password: document.getElementById("regPassword").value 
            };
            localStorage.setItem(`user_${name}`, JSON.stringify(user));
            localStorage.setItem("user", name);
            
            saveTasks(name); 
            
            document.getElementById("registrationModal").classList.add("hidden");
            showKanban();
            loadTasks(name);
        }
    };

    document.getElementById("loginConfirmBtn").onclick = (e) => {
        e.preventDefault();
        const name = document.getElementById("loginName").value.trim();
        const pass = document.getElementById("loginPassword").value.trim();
        const savedUser = JSON.parse(localStorage.getItem(`user_${name}`));

        if (savedUser && savedUser.password === pass) {
            localStorage.setItem("user", name);
            document.getElementById("loginModal").classList.add("hidden");
            showKanban();
            loadTasks(name);
        } else {
            alert("Uncorrect password or login");
        }
    };

    document.getElementById("logout-btn").onclick = () => {
        localStorage.removeItem("user");
        location.reload(); 
    };

    document.getElementById("registration-btn").onclick = () => document.getElementById("registrationModal").classList.remove("hidden");
    document.getElementById("login-btn").onclick = () => document.getElementById("loginModal").classList.remove("hidden");
});
