// --- hash users password ---
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// --- AES key ---
async function getStoredKey() {
  let keyData = localStorage.getItem("aesKey");
  if (keyData) {
    const rawKey = Uint8Array.from(JSON.parse(keyData));
    return await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );
  } else {
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const rawKey = await crypto.subtle.exportKey("raw", key);
    localStorage.setItem("aesKey", JSON.stringify(Array.from(new Uint8Array(rawKey))));
    return key;
  }
}

async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(JSON.stringify(data));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
}

async function decryptData(encrypted, key) {
  const iv = new Uint8Array(encrypted.iv);
  const data = new Uint8Array(encrypted.data);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

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

// --- save/load users ---
async function saveUser(user) {
  const hashedPassword = await hashPassword(user.password);
  const safeUser = { name: user.name, email: user.email, password: hashedPassword };

  const key = await getStoredKey();
  const encrypted = await encryptData(safeUser, key);

  localStorage.setItem(`user_${user.name}`, JSON.stringify(encrypted));
}

async function getUser(name) {
  const encrypted = JSON.parse(localStorage.getItem(`user_${name}`));
  if (!encrypted) return null;

  const key = await getStoredKey();
  return await decryptData(encrypted, key);
}

// --- save/load tasks ---
async function saveTasks(userName) {
  if (!userName) return;

  const data = {
    todo: Array.from(document.querySelector(".todo-section .tasks").children)
      .map(t => t.querySelector(".task-text").textContent),
    progress: Array.from(document.querySelector(".in-progress-section .tasks").children)
      .map(t => t.querySelector(".task-text").textContent),
    done: Array.from(document.querySelector(".done-section .tasks").children)
      .map(t => t.querySelector(".task-text").textContent)
  };

  const key = await getStoredKey();
  const encrypted = await encryptData(data, key);
  localStorage.setItem(`kanbanTasks_${userName}`, JSON.stringify(encrypted));
}

async function loadTasks(userName) {
  const encrypted = JSON.parse(localStorage.getItem(`kanbanTasks_${userName}`));
  if (!encrypted) return;

  const key = await getStoredKey();
  const data = await decryptData(encrypted, key);
  // console.log(data);
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

// --- UI helpers ---
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

  document.getElementById("registerBtn").onclick = async (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    if (name) {
      const user = {
        name,
        email: document.getElementById("regEmail").value,
        password: document.getElementById("regPassword").value
      };
      await saveUser(user);
      localStorage.setItem("user", name);

      await saveTasks(name);

      document.getElementById("registrationModal").classList.add("hidden");
      showKanban();
      await loadTasks(name);
    }
  };

  document.getElementById("loginConfirmBtn").onclick = async (e) => {
    e.preventDefault();
    const name = document.getElementById("loginName").value.trim();
    const pass = document.getElementById("loginPassword").value.trim();
    const savedUser = await getUser(name);

    if (savedUser) {
      const hashedInput = await hashPassword(pass);
      if (savedUser.password === hashedInput) {
        localStorage.setItem("user", name);
        document.getElementById("loginModal").classList.add("hidden");
        showKanban();
        await loadTasks(name);
      } else {
        alert("Uncorrect password or login");
      }
    } else {
      alert("User is not found!");
    }
  };

  document.getElementById("logout-btn").onclick = () => {
    localStorage.removeItem("user");
    location.reload();
  };

  document.getElementById("registration-btn").onclick = () =>
    document.getElementById("registrationModal").classList.remove("hidden");
  document.getElementById("login-btn").onclick = () =>
    document.getElementById("loginModal").classList.remove("hidden");
});