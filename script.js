const tasklist = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');

let activeTask = null;

// Recupera tarefas do localStorage ao carregar
window.addEventListener("load", () => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    savedTasks.forEach(task => createTaskElement(task.text, task.img));
});

// Adiciona tarefa
function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    createTaskElement(taskText, null);
    taskInput.value = "";
    saveTasks(); // salva sempre que adiciona
}

// Cria elemento da tarefa (usado tanto para criar nova quanto para carregar do storage)
function createTaskElement(text, imgSrc) {
    const maxText = text.substring(0, 35);
    const li = document.createElement("li");

    li.innerHTML = `
        <img class="imgPreview" style="display:${imgSrc ? 'inline-block' : 'none'}" ${imgSrc ? `src="${imgSrc}"` : ''}>
        <span>${maxText}</span>
        <button class="imgButton">Imagem</button>
        <button onclick="editTask(this)">Editar</button>
        <button onclick="deleteTask(this)">Remover</button>
    `;

    // Selecionar tarefa
    li.addEventListener("click", (e) => {
        e.stopPropagation();
        if (activeTask) activeTask.classList.remove("activeTask");
        activeTask = li;
        li.classList.add("activeTask");
    });

    // Input oculto para upload
    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = "image/*";
    inputFile.style.display = "none";
    inputFile.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = li.querySelector(".imgPreview");
                img.src = e.target.result;
                img.style.display = "inline-block";
                saveTasks();
            };
            reader.readAsDataURL(file);
        }
    });
    li.appendChild(inputFile);

    // Botão "Imagem"
    const imgButton = li.querySelector(".imgButton");
    imgButton.addEventListener("click", (e) => {
        e.stopPropagation();
        inputFile.click();
    });

    tasklist.appendChild(li);
}

// Ctrl + V (Print Screen)
document.addEventListener("paste", function(event) {
    if (!activeTask) return;
    const items = event.clipboardData.items;
    for (let item of items) {
        if (item.type.startsWith("image")) {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = activeTask.querySelector(".imgPreview");
                img.src = e.target.result;
                img.style.display = "inline-block";
                saveTasks();
            };
            reader.readAsDataURL(file);
        }
    }
});

// Editar tarefa
function editTask(button) {
    const li = button.parentElement;
    const span = li.querySelector("span");
    const newText = prompt("Editar tarefa:", span.textContent);
    if (newText !== null && newText.trim() !== "") {
        span.textContent = newText.trim();
        saveTasks();
    }
}

// Deletar tarefa
function deleteTask(button) {
    const li = button.parentElement;
    if (li === activeTask) activeTask = null;
    tasklist.removeChild(li);
    saveTasks();
}

// Salva todas as tarefas no localStorage
function saveTasks() {
    const tasks = [];
    tasklist.querySelectorAll("li").forEach(li => {
        const text = li.querySelector("span").textContent;
        const img = li.querySelector(".imgPreview").src || null;
        tasks.push({ text, img });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
