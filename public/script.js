//новый
// Административные данные (логин и пароль)
const adminCredentials = {
    username: "admin",
    password: "admin123"
};

// Флаг, который определяет, авторизован ли администратор
let isAdmin = false;

// Обработчик кликов на пункты меню
document.querySelectorAll(".sidebar ul li").forEach((item) => {
    item.addEventListener("click", async () => {
        const tableKey = item.dataset.table;
        await fetchTableData(tableKey);
    });
});

// URL API
const apiUrl = "http://localhost:3000/api";

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
// Функция открытия модального окна
function openModal(title, bodyContent, onSubmit) {
    console.log("Открытие модального окна", title);

    // Закрываем уже открытое модальное окно (если оно есть)
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Открываем новое модальное окно
    const modal = document.createElement('div');
    modal.classList.add('modal');
    
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = title;
    
    const modalBody = document.createElement('div');
    modalBody.innerHTML = bodyContent;

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Закрыть';
    submitButton.addEventListener('click', function() {
        onSubmit(); 
        closeModal(); 
    });
    
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(submitButton);
    modal.appendChild(modalContent);

    document.body.appendChild(modal); 
    console.log("Модальное окно добавлено в DOM"); 
}




// Функция закрытия модального окна
function closeModal() {
    console.log("Закрытие модального окна");  // Проверка
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}



// Функция для отображения кнопок администратора
function showAdminButtons() {
    const adminActions = document.getElementById("admin-actions");
    
    if (adminActions) {  // Проверяем, существует ли элемент
        if (isAdmin) {
            adminActions.style.display = "block";  // Показываем кнопки CRUD
        } else {
            adminActions.style.display = "none";   // Скрываем кнопки CRUD
        }
    } else {
        console.error("Элемент с id 'admin-actions' не найден.");
    }
}


// CRUD
// Фильтрация таблицы по выбранному столбцу
function filterTable() {
    const searchValue = document.getElementById("search-value").value.trim().toLowerCase(); // Убираем пробелы и приводим к нижнему регистру
    const columnSelect = document.getElementById("column-select");
    const selectedColumn = columnSelect.value;
    const rows = document.querySelectorAll("#table-container table tbody tr");

    rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        let matchFound = false;

        // Находим индекс выбранного столбца
        const columnIndex = Array.from(columnSelect.options).findIndex(option => option.value === selectedColumn);
        const cell = cells[columnIndex];

        // Проверяем полное совпадение значения в выбранном столбце
        if (cell && cell.textContent.trim().toLowerCase() === searchValue) {
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
        if (response.status === 404) {
          throw new Error("Запись не найдена");
        }
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


// Добавление записи
function createRecord(tableName) {
    if (!isAdmin) {
        alert("Для добавления записи требуется авторизация как администратор.");
        return;
    }

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

    // Генерация строк таблицы
data.forEach((row) => {
  tableHtml += "<tr>";
  columns.forEach((col) => {
    tableHtml += `<td>${row[col]}</td>`;
  });

  const primaryKey = tablePrimaryKeys[tableName];

  tableHtml += `
    <td>
      ${isAdmin ? `<button onclick="editRecord('${tableName}', ${row[primaryKey]})">Изменить</button>` : ""}
      ${isAdmin ? `<button onclick="deleteRecord('${tableName}', ${row[primaryKey]})">Удалить</button>` : ""}
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

    // Объединяем таблицу и поле поиска
    container.innerHTML = tableHtml;
}

function adminLogin() {
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  if (username && password) {  // Проверяем существование элементов
    if (username.value === adminCredentials.username && password.value === adminCredentials.password) {
      isAdmin = true; // Устанавливаем флаг администратора
      toggleAdminMode(true); // Активируем административный режим
      closeModal(); // Закрываем модальное окно
    } else {
      const errorMessage = document.getElementById("error-message");
      if (errorMessage) {
        errorMessage.style.display = "block";
      }
    }
  } else {
    console.error("Не найдены элементы для логина и пароля");
  }
}

// Функция для переключения режима администратора
function toggleAdminMode(isAdmin) {
  const adminElements = document.querySelectorAll(".admin-only");

  // Показываем/скрываем элементы для администратора
  adminElements.forEach((el) => {
    el.style.display = isAdmin ? "block" : "none";
  });
 const addButton = document.getElementById("add-record");
  if (addButton) {
    addButton.style.display = isAdmin ? "block" : "none";
  }

  // Перерисовываем таблицу, чтобы обновить кнопки в ячейках
  const activeTable = document.querySelector(".sidebar ul li.active");
  if (activeTable) {
    const tableKey = activeTable.dataset.table;
    fetchTableData(tableKey); // Повторно рендерим таблицу
  }
}


// Функция для удаления кнопок "Добавить запись" из столбца "Действия"
function removeActionButtons() {
  const actionCells = document.querySelectorAll(".actions-cell"); // Пример: класс для ячеек столбца "Действия"

  actionCells.forEach(cell => {
    const addButton = cell.querySelector(".add-record-btn");
    if (addButton) {
      addButton.remove();
    }
  });
}

// Функция для закрытия модального окна
function closeModal() {
    console.log("Закрытие модального окна");
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Обработка отправки формы авторизации
document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  adminLogin();
});


// Функция вызова модального окна для авторизации
// Функция вызова модального окна для авторизации
function openAdminLoginModal() {
    openModal(
        "Авторизация администратора",
        `
            <form id="login-form">
                <label for="username">Логин:</label>
                <input type="text" id="username" required><br><br>
                <label for="password">Пароль:</label>
                <input type="password" id="password" required><br><br>
                <button type="submit">Войти</button>
            </form>
            <p id="error-message" style="color: red; display: none;">Неверный логин или пароль</p>
        `,
        () => {}
    );

    // Привязка события отправки формы к вызову `adminLogin`
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Останавливаем стандартное поведение
        adminLogin(); // Вызываем функцию для авторизации
    });
}


// Обработка логина администратора
function submitAdminLogin() {
    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;
    adminLogin(username, password);
    closeModal();
}

document.addEventListener("DOMContentLoaded", function () {
  // Убедитесь, что элементы загружены
  const loginForm = document.getElementById("login-form");
  
  if (loginForm) {
    // Обработчик для кнопки "Войти"
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Останавливаем стандартное поведение формы
      adminLogin(); // Вызываем функцию для авторизации
    });
  }
document.addEventListener("DOMContentLoaded", function () {
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  if (!username || !password) {
    console.error("Не найдены элементы для логина и пароля");
  }
});

  // Ваши другие функции могут быть внутри этого обработчика
});
document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault(); // Останавливаем стандартное поведение формы
  adminLogin(); // Вызываем функцию авторизации
});

document.getElementById("admin-btn").addEventListener("click", () => {
    console.log("Кнопка нажата!");  // Проверка нажатия кнопки
    openAdminLoginModal();
});
fetch(`${apiUrl}/clients/${primaryKeyValue}`)
  .then(response => {
    if (!response.ok) {
      console.error(`Ошибка запроса: ${response.status} ${response.statusText}`);
      throw new Error("Доступ запрещён");
    }
    return response.json();
  })
  .then(data => {
    console.log("Данные клиента:", data);
  })
  .catch(error => {
    console.error("Ошибка:", error);
    alert("Ошибка доступа: " + error.message);
  });

