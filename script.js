const columns = {
    todo: document.querySelector("#todo"),
    progress: document.querySelector("#progress"),
    done: document.querySelector("#done"),
};

let dragElement = null;
let placeholder = null;

let kanbanData = {
    todo: [],
    progress: [],
    done: []
};

function loadFromLocalStorage() {
    const data = localStorage.getItem("kanbanData");
    if (!data) return;

    kanbanData = JSON.parse(data);

    Object.keys(columns).forEach(col => {
        columns[col].innerHTML = `
      <div class="heading">
        <div class="left">${columns[col].querySelector(".left")?.textContent}</div>
        <div class="right count">${kanbanData[col].length}</div>
      </div>
    `;

        kanbanData[col].forEach(task => {
            const el = createTask(task.title, task.desc);
            columns[col].appendChild(el);
        });
    });

    updateCounts();
}

loadFromLocalStorage();

function saveToLocalStorage() {
    Object.keys(columns).forEach(col => {
        const tasks = columns[col].querySelectorAll(".task");
        kanbanData[col] = [];

        tasks.forEach(t => {
            kanbanData[col].push({
                title: t.querySelector("h2").innerText,
                desc: t.querySelector("p").innerText,
            });
        });
    });

    localStorage.setItem("kanbanData", JSON.stringify(kanbanData));
}

function updateCounts() {
    Object.keys(columns).forEach(col => {
        const countEl = columns[col].querySelector(".count");
        const tasks = columns[col].querySelectorAll(".task");
        countEl.innerText = tasks.length;
    });
}

function createTask(title, desc) {
    const div = document.createElement("div");
    div.classList.add("task");
    div.setAttribute("draggable", "true");

    div.innerHTML = `
    <h2>${title}</h2>
    <p>${desc}</p>
    <button class="delete-btn">Delete</button>
  `;

    /* DRAG START */
    div.addEventListener("dragstart", () => {
        dragElement = div;
        placeholder = document.createElement("div");
        placeholder.classList.add("placeholder");
    });

    /* DRAG END */
    div.addEventListener("dragend", () => {
        if (placeholder?.parentNode) placeholder.remove();
        placeholder = null;
        saveToLocalStorage();
        updateCounts();
    });

    /* DELETE BUTTON */
    div.querySelector(".delete-btn").addEventListener("click", () => {
        div.remove();
        saveToLocalStorage();
        updateCounts();
    });

    return div;
}

function addDragEventsOnColumn(column) {
    column.addEventListener("dragenter", (e) => {
        e.preventDefault();
        column.classList.add("hover-over");
    });

    column.addEventListener("dragleave", () => {
        column.classList.remove("hover-over");
    });

    column.addEventListener("dragover", (e) => {
        e.preventDefault();
        const heading = column.querySelector(".heading");

        if (placeholder && heading.nextSibling !== placeholder) {
            column.insertBefore(placeholder, heading.nextSibling);
        }
    });

    column.addEventListener("drop", () => {
        column.classList.remove("hover-over");

        const heading = column.querySelector(".heading");

        if (placeholder && placeholder.parentNode === column) {
            column.insertBefore(dragElement, placeholder);
            placeholder.remove();
        } else {
            column.appendChild(dragElement);
        }

        saveToLocalStorage();
        updateCounts();
    });
}

Object.values(columns).forEach(addDragEventsOnColumn);

const modal = document.querySelector(".modal");
const modalBg = document.querySelector(".modal .bg");
const toggleModalButton = document.querySelector("#toggle-modal");
const addTaskButton = document.querySelector("#add-new-task");

toggleModalButton.addEventListener("click", () => modal.classList.add("active"));
modalBg.addEventListener("click", () => modal.classList.remove("active"));

/* ADD NEW TASK */
addTaskButton.addEventListener("click", () => {
    const title = document.querySelector("#task-title-input").value.trim();
    const desc = document.querySelector("#task-desc-input").value.trim();

    if (!title) return;

    const newTask = createTask(title, desc);
    columns.todo.appendChild(newTask);

    document.querySelector("#task-title-input").value = "";
    document.querySelector("#task-desc-input").value = "";
    modal.classList.remove("active");

    saveToLocalStorage();
    updateCounts();
});

updateCounts();
