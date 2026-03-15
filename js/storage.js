function showLoginForm() {
  document.getElementById("registration-btn").classList.remove("hidden");
  document.getElementById("login-btn").classList.remove("hidden");
  document.getElementById("logout-btn").classList.add("hidden");
  document.getElementById("kanban-section").classList.add("hidden"); 
}

function showKanban() {
  document.getElementById("registration-btn").classList.add("hidden");
  document.getElementById("login-btn").classList.add("hidden");
  document.getElementById("logout-btn").classList.remove("hidden");
  document.getElementById("kanban-section").classList.remove("hidden");
}


function saveUser(user) {
  localStorage.setItem(`user_${user.name}`, JSON.stringify(user));
}


function getUser(name) {
  const data = localStorage.getItem(`user_${name}`);
  return data ? JSON.parse(data) : null;
}

function saveTasks(user) {
  const changes = {
    todo: Array.from(document.querySelector(".todo-section .tasks").children)
      .map(t => t.querySelector(".task-text").textContent),
    progress: Array.from(document.querySelector(".in-progress-section .tasks").children)
      .map(t => t.querySelector(".task-text").textContent),
    done: Array.from(document.querySelector(".done-section .tasks").children)
      .map(t => t.querySelector(".task-text").textContent)
  };
  localStorage.setItem(`kanbanTasks_${user}`, JSON.stringify(changes));
}

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem("user");

  if (currentUser) {
    showKanban();
    if (localStorage.getItem(`kanbanTasks_${currentUser}`)) {
      loadTasks(currentUser);
    } else {
      saveTasks(currentUser);
    }
  } else {
    showLoginForm();
  }

  document.getElementById("registration-btn").onclick = () => {
    document.getElementById("registrationModal").classList.remove("hidden");
  };
  document.getElementById("login-btn").onclick = () => {
    document.getElementById("loginModal").classList.remove("hidden");
  };

  
  document.getElementById("registerBtn").onclick = (e) => {
    e.preventDefault(); 
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (name && email && password) {
      const user = { name, email, password };
      saveUser(user);
      localStorage.setItem("user", name);
      document.getElementById("registrationModal").classList.add("hidden");
      showKanban();
      
      localStorage.setItem(`kanbanTasks_${name}`, JSON.stringify({ todo: [], progress: [], done: [] }));

      document.getElementById("registrationForm").reset(); 
    } else {
      alert("Fill information!");
    }
  };

  
  document.getElementById("loginConfirmBtn").onclick = (e) => {
    e.preventDefault();
    const name = document.getElementById("loginName").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const user = getUser(name);
    if (user) {
      if (user.password === password) {
        localStorage.setItem("user", name);
        document.getElementById("loginModal").classList.add("hidden");
        showKanban();
        
        if (localStorage.getItem(`kanbanTasks_${name}`)) {
        loadTasks(name);
      } else {
        localStorage.setItem(`kanbanTasks_${name}`, JSON.stringify({ todo: [], progress: [], done: [] }));
        }
        
        document.getElementById("loginForm").reset(); 
      } else {
        alert("Uncorrect password!");
      }
    } else {
      alert("User is not found!");
    }
  };

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("user");
    showLoginForm();

    document.getElementById("registrationForm").reset();
    document.getElementById("loginForm").reset();
    
    window.location.reload();
  });
});
