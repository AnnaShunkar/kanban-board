// --- moving 
function taskButtons(taskElement) {
    const currentSection = taskElement.closest('section');
    const leftBtn = taskElement.querySelector('.move-left');
    const rightBtn = taskElement.querySelector('.move-right');

    if (currentSection.classList.contains('todo-section')) {
        leftBtn.hidden = true;
        rightBtn.hidden = false;
    } else if (currentSection.classList.contains('in-progress-section')) {
        leftBtn.hidden = false;
        rightBtn.hidden = false;
    } else if (currentSection.classList.contains('done-section')) {
        leftBtn.hidden = false;
        rightBtn.hidden = true;
    }
}

function moveTaskRight(taskElement) {
    const currentSection = taskElement.closest('section');
    let nextSection;

    if (currentSection.classList.contains('todo-section')) {
        nextSection = document.querySelector('.in-progress-section .tasks');
    } else if (currentSection.classList.contains('in-progress-section')) {
        nextSection = document.querySelector('.done-section .tasks');
    }

    if (nextSection) {
        nextSection.appendChild(taskElement);
        taskButtons(taskElement);
        
        const user = localStorage.getItem('user');
        if (user && typeof saveTasks === 'function') saveTasks(user);
    }
}

function moveTaskLeft(taskElement) {
    const currentSection = taskElement.closest('section');
    let prevSection;

    if (currentSection.classList.contains('in-progress-section')) {
        prevSection = document.querySelector('.todo-section .tasks');
    } else if (currentSection.classList.contains('done-section')) {
        prevSection = document.querySelector('.in-progress-section .tasks');
    }

    if (prevSection) {
        prevSection.appendChild(taskElement);
        taskButtons(taskElement);
        
        const user = localStorage.getItem('user');
        if (user && typeof saveTasks === 'function') saveTasks(user);
    }
}
// функция для включения inline-редактирования
function enableInlineEditing(textDiv) {
  textDiv.addEventListener("click", () => {
    const currentText = textDiv.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.className = "task-edit";

    textDiv.replaceWith(input);
    input.focus();

    const finishEdit = async () => {
      const newText = input.value.trim() || currentText;
      const newDiv = document.createElement("div");
      newDiv.className = "task-text";
      newDiv.textContent = newText;

      input.replaceWith(newDiv);
      enableInlineEditing(newDiv); // снова навешиваем обработчик

      const currentUser = localStorage.getItem("user");
      if (currentUser) {
        await saveTasks(currentUser);
      }
    };

    input.addEventListener("blur", finishEdit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        finishEdit();
      }
    });
  });
};

document.addEventListener('click', e => {
    const rightBtn = e.target.closest('.move-right');
    const leftBtn = e.target.closest('.move-left');

    if (rightBtn) {
        moveTaskRight(rightBtn.closest('.task'));
    } else if (leftBtn) {
        moveTaskLeft(leftBtn.closest('.task'));
    }
});
