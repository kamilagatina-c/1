// Обработчик кликов на пункты меню
document.querySelectorAll(".sidebar ul li").forEach((item) => {
    item.addEventListener("click", () => {
        const tableKey = item.dataset.table;
        renderTable(tableKey);
    });
});

// URL API
const apiUrl = "http://localhost:3000/api";

// Обработчик кликов на пункты меню
document.querySelectorAll(".sidebar ul li").forEach((item) => {
    item.addEventListener("click", async () => {
        const tableKey = item.dataset.table;
        await fetchTableData(tableKey);
    });
});

// Получение данных и рендер таблицы
async function fetchTableData(tableKey) {
    const container = document.getElementById("table-container");
    const title = document.getElementById("table-title");

    try {
        const response = await fetch(`${apiUrl}/${tableKey}`);
        if (!response.ok) {
            throw new Error("Ошибка загрузки данных");
        }

        const data = await response.json();
        renderTable(data, tableKey);
    } catch (error) {
        console.error("Ошибка:", error);
        container.innerHTML = "<p>Ошибка загрузки данных</p>";
        title.textContent = "Ошибка";
    }
}

//CRUD
// Добавление записи
function createRecord(tableName) {

    // Определяем обязательные поля для каждой таблицы
    const tableFields = {
        clients: ["full_name", "email", "phone", "status_id"],
        filmdatabase: ["film_name", "rating", "genre_id", "tape_id"],
        genre: ["name"],
        rental: ["client_id", "tape_id", "service_date", "expected_return_date", "return_date", "violation_id"],
        status: ["name"],
        tapes: ["cost"],
        violations: ["fine"],
    };

    const requiredFields = tableFields[tableName] || [];
    if (!requiredFields.length) {
        alert("Неизвестная таблица.");
        return;
    }

    // Генерируем форму с обязательными полями
    const formFields = requiredFields
        .map(
            (field) => `
                <label for="${field}">${field}:</label>
                <input type="text" id="${field}" name="${field}" required>
                <br>
            `
        )
        .join("");

    openModal(
        "Добавить запись",
        `<form id="create-form">${formFields}</form>`,
        () => {
            const form = document.getElementById("create-form");
            const formData = Object.fromEntries(new FormData(form));

            // Выполняем запрос на сервер для добавления записи
            fetch(`/api/${tableName}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Ошибка при добавлении записи");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Запись добавлена:", data);
                    closeModal();
                    refreshTable(tableName); // Обновляем таблицу
                })
                .catch((error) => {
                    console.error("Ошибка:", error);
                    alert("Не удалось добавить запись.");
                });
        }
    );
}


// Рендер таблицы с выбором столбца для поиска
function renderTable(data, tableName) {
    const container = document.getElementById("table-container");
    const title = document.getElementById("table-title");
    const searchContainer = document.getElementById("search-container");
    
    if (!data.length) {
        container.innerHTML = "<p>Данные отсутствуют</p>";
        title.textContent = `Таблица: ${tableName}`;
        return;
    }

    title.textContent = `Таблица: ${tableName}`;

    // Генерация выпадающего списка для поиска по столбцам
    const columns = Object.keys(data[0]);
    const columnSelect = document.getElementById("column-select");
    columnSelect.innerHTML = "";  // Очищаем список перед добавлением новых элементов
    columns.forEach((col) => {
        const option = document.createElement("option");
        option.value = col;
        option.textContent = col;
        columnSelect.appendChild(option);
    });

    // Добавляем кнопку добавления записи
    const addButtonHtml = `<button onclick="createRecord('${tableName}')">Добавить запись</button>`;

    let tableHtml = "<table><thead><tr>";

    // Генерация заголовков
    columns.forEach((col) => {
        tableHtml += `<th>${col}</th>`;
    });
    tableHtml += "<th>Действия</th></tr></thead><tbody>";

    const tablePrimaryKeys = {
        clients: "client_id",
        filmdatabase: "film_id",
        genre: "genre_id",
        rental: "rental_id",
        status: "status_id",
        tapes: "tape_id",
        violations: "violation_id",
    };

    // Генерация строк
    data.forEach((row) => {
        tableHtml += "<tr>";
        columns.forEach((col) => {
            tableHtml += `<td>${row[col]}</td>`;
        });

        const primaryKey = tablePrimaryKeys[tableName];

        tableHtml += `
            <td>
                <button onclick="deleteRecord('${tableName}', ${row[primaryKey]})">Удалить</button>
                <button onclick="editRecord('${tableName}', ${row[primaryKey]})">Изменить</button>
            </td>
        `;
        tableHtml += "</tr>";
    });

    tableHtml += "</tbody></table>";

    // Добавляем поле поиска над таблицей
    searchContainer.innerHTML = `
        <label for="column-select">Выберите столбец для поиска:</label>
        <select id="column-select">
            ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
        </select>
        <label for="search-value">Значение:</label>
        <input type="text" id="search-value" placeholder="Введите значение для поиска">
        <button type="button" onclick="filterTable()">Искать</button>
    `;

    // Объединяем таблицу и кнопку
    container.innerHTML = addButtonHtml + tableHtml;
}

// Фильтрация таблицы по выбранному столбцу
function filterTable() {
    const searchValue = document.getElementById("search-value").value.toLowerCase();
    const columnSelect = document.getElementById("column-select");
    const selectedColumn = columnSelect.value;
    const rows = document.querySelectorAll("#table-container table tbody tr");

    rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        let matchFound = false;

        // Находим индекс выбранного столбца
        const columnIndex = Array.from(columnSelect.options).findIndex(option => option.value === selectedColumn);
        const cell = cells[columnIndex];

        // Проверяем значение в выбранном столбце
        if (cell && cell.textContent.toLowerCase().includes(searchValue)) {
            matchFound = true;
        }

        row.style.display = matchFound ? "" : "none"; // Показываем или скрываем строку
    });
}

function editRecord(tableName, id) {
    // Получаем данные записи по ID
    fetch(`/api/${tableName}/${id}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Ошибка при получении записи");
            }
            return response.json();
        })
        .then((record) => {
            // Генерируем форму с текущими значениями
            const formFields = Object.keys(record)
                .map(
                    (key) => `
                        <label for="${key}">${key}:</label>
                        <input type="text" id="${key}" name="${key}" value="${record[key]}" required>
                        <br>
                    `
                )
                .join("");

            // Открываем модальное окно с формой
            openModal(
                "Изменить запись",
                `<form id="edit-form">${formFields}</form>`,
                () => {
                    const form = document.getElementById("edit-form");
                    const formData = Object.fromEntries(new FormData(form));

                    // Отправляем обновлённые данные на сервер
                    fetch(`/api/${tableName}/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData),
                    })
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error("Ошибка при изменении записи");
                            }
                            return response.json();
                        })
                        .then((data) => {
                            console.log("Запись изменена:", data);
                            closeModal();
                            refreshTable(tableName); // Обновляем таблицу
                        })
                        .catch((error) => {
                            console.error("Ошибка:", error);
                            alert("Не удалось изменить запись.");
                        });
                }
            );
        })
        .catch((error) => {
            console.error("Ошибка при получении записи:", error);
            alert("Не удалось загрузить данные записи.");
        });
}


// Удаление записи
function deleteRecord(tableName, id) {
    openModal(
        "Удалить запись",
        `<p>Вы уверены, что хотите удалить запись с ID: ${id}?</p>`,
        () => {
            fetch(`/api/${tableName}/${id}`, {
                method: "DELETE",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Ошибка при удалении записи");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Запись удалена:", data);
                    closeModal();
                    refreshTable(tableName); // Обновить таблицу
                })
                .catch((error) => {
                    console.error("Ошибка:", error);
                    alert("Не удалось удалить запись.");
                });
        }
    );
}

function refreshTable(tableName) {
    fetch(`/api/${tableName}`)
        .then((response) => response.json())
        .then((data) => {
            renderTable(data, tableName); // Обновляем таблицу
        })
        .catch((error) => {
            console.error("Ошибка при обновлении таблицы:", error);
        });
}


function openModal(title, bodyContent, actionCallback) {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalActionButton = document.getElementById("modal-action-button");

    modalTitle.textContent = title; // Устанавливаем заголовок
    modalBody.innerHTML = bodyContent; // Устанавливаем контент
    modalActionButton.onclick = actionCallback; // Устанавливаем действие

    modal.style.display = "block"; // Показываем модальное окно
}

function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none"; // Скрываем модальное окно
}

// Закрытие модального окна при клике вне его
window.onclick = function (event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
        closeModal();
    }
};



