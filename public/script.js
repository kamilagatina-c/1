// Обработчик кликов на пункты меню
document.querySelectorAll(".sidebar ul li").forEach((item) => {
    item.addEventListener("click", async () => {
        const tableKey = item.dataset.table;
        await fetchTableData(tableKey);
    });
});

// URL API
const apiUrl = "http://localhost:3000/api";

// Функция для получения данных и отображения таблицы
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

// Функция для поиска данных
async function searchTableData(tableKey, searchField, searchValue) {
    const container = document.getElementById("table-container");
    const title = document.getElementById("table-title");

    try {
        const response = await fetch(`${apiUrl}/${tableKey}?${searchField}=${searchValue}`);
        if (!response.ok) {
            throw new Error("Ошибка поиска данных");
        }

        const data = await response.json();
        renderTable(data, tableKey);
    } catch (error) {
        console.error("Ошибка:", error);
        container.innerHTML = "<p>Ошибка поиска данных</p>";
        title.textContent = "Ошибка";
    }
}

// Функция для рендеринга таблицы
function renderTable(data, tableName) {
    const container = document.getElementById("table-container");
    const title = document.getElementById("table-title");

    // Если данных нет
    if (!data.length) {
        container.innerHTML = "<p>Данные отсутствуют</p>";
        title.textContent = `Таблица: ${tableName}`;
        return;
    }

    title.textContent = `Таблица: ${tableName}`;

    // Добавляем кнопку добавления записи и форму поиска
    const addButtonHtml = `<button onclick="createRecord('${tableName}')">Добавить запись</button>`;
    const searchFormHtml = `
        <form id="searchForm" onsubmit="handleSearch(event, '${tableName}')">
            <label for="searchField">Поле поиска:</label>
            <select id="searchField" name="searchField">
                ${Object.keys(data[0]).map(field => `<option value="${field}">${field}</option>`).join("")}
            </select>
            <input type="text" id="searchValue" name="searchValue" placeholder="Введите значение">
            <button type="submit">Искать</button>
        </form>
    `;

    let tableHtml = "<table><thead><tr>";

    // Генерация заголовков
    Object.keys(data[0]).forEach((col) => {
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
        Object.values(row).forEach((value) => {
            tableHtml += `<td>${value}</td>`;
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

    // Объединяем таблицу, кнопку добавления и форму поиска
    container.innerHTML = searchFormHtml + addButtonHtml + tableHtml;
}

// Обработчик отправки формы поиска
function handleSearch(event, tableName) {
    event.preventDefault(); // Предотвращаем перезагрузку страницы
    const searchField = document.getElementById("searchField").value;
    const searchValue = document.getElementById("searchValue").value;

    if (!searchValue.trim()) {
        alert("Введите значение для поиска.");
        return;
    }

    searchTableData(tableName, searchField, searchValue);
}
