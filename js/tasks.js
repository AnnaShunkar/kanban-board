function taskButtons(taskElement) {
    const currentSection = taskElement.closest("section");
    const leftBtn = taskElement.querySelector(".move-left");
    const rightBtn = taskElement.querySelector(".move-right");

    if (!currentSection || !leftBtn || !rightBtn) {
        return;
    }

    if (currentSection.classList.contains("todo-section")) {
        leftBtn.hidden = true;
        rightBtn.hidden = false;
    } else if (currentSection.classList.contains("in-progress-section")) {
        leftBtn.hidden = false;
        rightBtn.hidden = false;
    } else if (currentSection.classList.contains("done-section")) {
        leftBtn.hidden = false;
        rightBtn.hidden = true;
    }
}

function normalizeTaskMarkup() {
    document.querySelectorAll(".task").forEach((taskElement) => {
        const textElement = taskElement.querySelector(".task-text");
        const labelElement = taskElement.querySelector("label");

        if (!textElement && labelElement) {
            const replacement = document.createElement("div");
            replacement.className = "task-text";
            replacement.textContent = labelElement.textContent.trim();
            labelElement.replaceWith(replacement);
        }

        const duplicateInput = taskElement.querySelector("#input-task");
        if (duplicateInput) {
            duplicateInput.remove();
        }

        taskButtons(taskElement);
    });
}

function moveTaskRight(taskElement) {
    const currentSection = taskElement.closest("section");
    let nextSection;

    if (currentSection.classList.contains("todo-section")) {
        nextSection = document.querySelector(".in-progress-section .tasks");
    } else if (currentSection.classList.contains("in-progress-section")) {
        nextSection = document.querySelector(".done-section .tasks");
    }

    if (nextSection) {
        nextSection.appendChild(taskElement);
        taskButtons(taskElement);

        const user = localStorage.getItem("user");
        if (user && typeof saveTasks === "function") {
            saveTasks(user);
        }
    }
}

function moveTaskLeft(taskElement) {
    const currentSection = taskElement.closest("section");
    let prevSection;

    if (currentSection.classList.contains("in-progress-section")) {
        prevSection = document.querySelector(".todo-section .tasks");
    } else if (currentSection.classList.contains("done-section")) {
        prevSection = document.querySelector(".in-progress-section .tasks");
    }

    if (prevSection) {
        prevSection.appendChild(taskElement);
        taskButtons(taskElement);

        const user = localStorage.getItem("user");
        if (user && typeof saveTasks === "function") {
            saveTasks(user);
        }
    }
}

function startTaskEditing(textElement) {
    const taskElement = textElement.closest(".task");
    if (!taskElement || taskElement.querySelector(".task-editor")) {
        return;
    }

    const currentText = textElement.textContent.trim();
    const editor = document.createElement("textarea");
    editor.className = "task-editor";
    editor.value = currentText;
    editor.rows = Math.max(2, currentText.split("\n").length);

    textElement.replaceWith(editor);
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);

    const finishEdit = async () => {
        const newText = editor.value.trim() || currentText || "New task";
        const newTextElement = document.createElement("div");
        newTextElement.className = "task-text";
        newTextElement.textContent = newText;

        editor.replaceWith(newTextElement);

        const currentUser = localStorage.getItem("user");
        if (currentUser && typeof saveTasks === "function") {
            await saveTasks(currentUser);
        }
    };

    editor.addEventListener("blur", finishEdit, { once: true });
    editor.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            editor.blur();
        }
    });
}

document.addEventListener("click", (event) => {
    const rightBtn = event.target.closest(".move-right");
    const leftBtn = event.target.closest(".move-left");
    const taskText = event.target.closest(".task-text");

    if (rightBtn) {
        moveTaskRight(rightBtn.closest(".task"));
        return;
    }

    if (leftBtn) {
        moveTaskLeft(leftBtn.closest(".task"));
        return;
    }

    if (taskText) {
        startTaskEditing(taskText);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    normalizeTaskMarkup();
});
