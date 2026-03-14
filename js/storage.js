function showLoginForm() {
  document.getElementById("username").classList.remove("hidden");
  document.getElementById("login-btn").classList.remove("hidden");
  document.getElementById("logout-btn").classList.add("hidden");
  document.getElementById("kanban-section").classList.add("hidden");
}

function showKanban() {
  document.getElementById("username").classList.add("hidden");
  document.getElementById("login-btn").classList.add("hidden");
  document.getElementById("logout-btn").classList.remove("hidden");
  document.getElementById("kanban-section").classList.remove("hidden");
}
function saveTasks(user) {
    const changes = {
        todo: Array.from(document.querySelector(".todo-section .tasks").children).map(t => t.querySelector(".task-text").textContent),
        progress: Array.from(document.querySelector(".in-progress-section .tasks").children).map(t => t.querySelector(".task-text").textContent),
        done: Array.from(document.querySelector(".done-section .tasks").children).map(t => t.querySelector(".task-text").textContent)
    };
  localStorage.setItem(`kanbanTasks_${user}`, JSON.stringify(changes));
  if (!user) {
    showKanban();
  }
}



document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("user");

  if (user) {
    showKanban();
    if (localStorage.getItem(`kanbanTasks_${user}`)) {
      loadTasks(user); 
    } else {
      saveTasks(user); 
    }
  } else {
    showLoginForm();
  }

  document.getElementById("login-btn").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    if (username) {
      localStorage.setItem("user", username);
      showKanban();
      if (localStorage.getItem(`kanbanTasks_${username}`)) {
        loadTasks(username); 
      } else {
         location.reload(); 
      }
    } else {
      alert("Enter name!");
    }
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    showLoginForm();
  });
});
