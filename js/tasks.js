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
  }
}

document.addEventListener('click', e => {
  if (e.target.closest('.move-right')) {
    const taskElement = e.target.closest('.task');
    moveTaskRight(taskElement);
  }
});