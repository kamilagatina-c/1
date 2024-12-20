const express = require('express');
const path = require('path');
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// Middleware для обработки JSON и данных форм
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Указываем папку с вашими статическими файлами
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к базе данных
const connection = mysql.createConnection({
    host: "localhost",
    user: "admin",
    database: "videorent",
    password: "admin"
});

connection.connect(err => {
    if (err) {
        console.error("Ошибка подключения к базе данных:", err.message);
    } else {
        console.log("Подключение к серверу MySQL успешно установлено");
    }
});



//CRUD
// Добавление записи
app.post("/api/:table", (req, res) => {
    const { table } = req.params;
    const data = req.body;

    // Определяем разрешённые таблицы и их поля
    const tableFields = {
        clients: ["full_name", "email", "phone", "status_id"],
        filmdatabase: ["film_name", "rating", "genre_id", "tape_id"],
        genre: ["name"],
        rental: ["client_id", "tape_id", "service_date", "expected_return_date", "return_date", "violation_id"],
        status: ["name"],
        tapes: ["cost"],
        violations: ["fine"],
    };

    // Проверка наличия таблицы в списке разрешённых
    if (!Object.keys(tableFields).includes(table)) {
        return res.status(400).json({ error: "Таблица недоступна" });
    }

    // Проверка наличия обязательных полей
    const requiredFields = tableFields[table];
    const missingFields = requiredFields.filter((field) => !(field in data));
    if (missingFields.length) {
        return res.status(400).json({
            error: "Отсутствуют обязательные поля",
            missingFields,
        });
    }

    // Генерация запроса
    const sql = `INSERT INTO ${table} (${requiredFields.join(", ")}) VALUES (${requiredFields.map(() => "?").join(", ")})`;

    // Выполнение запроса
    connection.query(sql, requiredFields.map((field) => data[field]), (err, result) => {
        if (err) {
            console.error("Ошибка добавления:", err.message);
            return res.status(500).json({ error: "Ошибка сервера", details: err.message });
        }
        res.json({ message: "Запись добавлена", insertId: result.insertId });
    });
});


// Получение данных из таблицы
app.get("/api/:table", (req, res) => {
    const table = req.params.table;

    // Проверка на доступные таблицы
    const allowedTables = ["clients", "filmdatabase", "genre", "rental", "status", "tapes", "violations"];
    if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: "Таблица недоступна" });
    }

    // Запрос к базе данных
    connection.query(`SELECT * FROM ${table}`, (err, results) => {
        if (err) {
            console.error("Ошибка запроса:", err.message);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
        res.json(results);
    });
});

// Изменение записи
app.put("/api/:table/:id", (req, res) => {
    const { table, id } = req.params;
    const data = req.body;

    // Список разрешенных таблиц и их ключей
    const tableKeys = {
        clients: "client_id",
        filmdatabase: "film_id",
        genre: "genre_id",
        rental: "rental_id",
        status: "status_id",
        tapes: "tape_id",
        violations: "violation_id",
    };

    // Проверяем, существует ли таблица
    const primaryKey = tableKeys[table];
    if (!primaryKey) {
        return res.status(400).json({ error: "Таблица недоступна" });
    }

    connection.query(`UPDATE ${table} SET ? WHERE ${primaryKey} = ?`, [data, id], (err, result) => {
        if (err) {
            console.error("Ошибка изменения:", err.message);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
        res.json({ message: "Запись обновлена", affectedRows: result.affectedRows });
    });
});


// Удаление записи
app.delete("/api/:table/:id", (req, res) => {
    const { table, id } = req.params;

    // Список разрешенных таблиц и их ключей
    const tableKeys = {
        clients: "client_id",
        filmdatabase: "film_id",
        genre: "genre_id",
        rental: "rental_id",
        status: "status_id",
        tapes: "tape_id",
        violations: "violation_id",
    };

    // Проверяем, существует ли таблица
    const primaryKey = tableKeys[table];
    if (!primaryKey) {
        return res.status(400).json({ error: "Таблица недоступна" });
    }

    // Выполняем запрос на удаление
    connection.query(`DELETE FROM ${table} WHERE ${primaryKey} = ?`, [id], (err, result) => {
        if (err) {
            console.error("Ошибка удаления:", err.message);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
        res.json({ message: "Запись удалена", affectedRows: result.affectedRows });
    });
});


// Получение записи по ID
app.get("/api/:table/:id", (req, res) => {
    const { table, id } = req.params;

    const tablePrimaryKeys = {
        clients: "client_id",
        filmdatabase: "film_id",
        genre: "genre_id",
        rental: "rental_id",
        status: "status_id",
        tapes: "tape_id",
        violations: "violation_id",
    };

    const primaryKey = tablePrimaryKeys[table];

    if (!primaryKey) {
        return res.status(400).json({ error: "Таблица недоступна" });
    }

    connection.query(
        `SELECT * FROM ${table} WHERE ${primaryKey} = ?`,
        [id],
        (err, results) => {
            if (err) {
                console.error("Ошибка при получении записи:", err.message);
                return res.status(500).json({ error: "Ошибка сервера" });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "Запись не найдена" });
            }
            res.json(results[0]); // Возвращаем первую запись
        }
    );
});



// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});