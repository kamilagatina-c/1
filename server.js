const express = require('express');
const path = require('path');
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// Образцовые логин и пароль для администратора
const adminCredentials = {
    username: "admin",
    password: "admin123" // Простое значение пароля для примера, в реальном приложении используйте хешированный пароль
};

// Функция для генерации токена
const generateToken = (userId) => {
    return jwt.sign({ userId }, 'your_jwt_secret', { expiresIn: '1h' });
};

// Middleware для проверки токена
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(403).json({ error: "Необходимо авторизоваться" });
    }

    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Неверный токен" });
        }
        req.userId = decoded.userId; // добавляем userId в запрос
        next();
    });
};

// Логин (получение токена)
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    
    // Проверка введенного логина и пароля с образцовыми значениями
    if (username === adminCredentials.username && password === adminCredentials.password) {
        // Генерация токена
        const token = generateToken(adminCredentials.username);
        res.json({ message: "Успешный вход", token });
    } else {
        return res.status(401).json({ error: "Неверный логин или пароль" });
    }
});

// CRUD

// Добавление записи (доступно только для администраторов)
app.post("/api/:table", authenticate, (req, res) => {
    const { table } = req.params;
    const data = req.body;

    const tableFields = {
        clients: ["full_name", "email", "phone", "status_id"],
        filmdatabase: ["film_name", "rating", "genre_id", "tape_id"],
        genre: ["name"],
        rental: ["client_id", "tape_id", "service_date", "expected_return_date", "return_date", "violation_id"],
        status: ["name"],
        tapes: ["cost"],
        violations: ["fine"],
    };

    if (!Object.keys(tableFields).includes(table)) {
        return res.status(400).json({ error: "Таблица недоступна" });
    }

    const requiredFields = tableFields[table];
    const missingFields = requiredFields.filter((field) => !(field in data));
    if (missingFields.length) {
        return res.status(400).json({
            error: "Отсутствуют обязательные поля",
            missingFields,
        });
    }

    const sql = `INSERT INTO ${table} (${requiredFields.join(", ")}) VALUES (${requiredFields.map(() => "?").join(", ")})`;

    connection.query(sql, requiredFields.map((field) => data[field]), (err, result) => {
        if (err) {
            console.error("Ошибка добавления:", err.message);
            return res.status(500).json({ error: "Ошибка сервера", details: err.message });
        }
        res.json({ message: "Запись добавлена", insertId: result.insertId });
    });
});

// Изменение записи (доступно только для администраторов)
app.put("/api/:table/:id", authenticate, (req, res) => {
    const { table, id } = req.params;
    const data = req.body;

    const tableKeys = {
        clients: "client_id",
        filmdatabase: "film_id",
        genre: "genre_id",
        rental: "rental_id",
        status: "status_id",
        tapes: "tape_id",
        violations: "violation_id",
    };

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

// Удаление записи (доступно только для администраторов)
app.delete("/api/:table/:id", authenticate, (req, res) => {
    const { table, id } = req.params;

    const tableKeys = {
        clients: "client_id",
        filmdatabase: "film_id",
        genre: "genre_id",
        rental: "rental_id",
        status: "status_id",
        tapes: "tape_id",
        violations: "violation_id",
    };

    const primaryKey = tableKeys[table];
    if (!primaryKey) {
        return res.status(400).json({ error: "Таблица недоступна" });
    }

    connection.query(`DELETE FROM ${table} WHERE ${primaryKey} = ?`, [id], (err, result) => {
        if (err) {
            console.error("Ошибка удаления:", err.message);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
        res.json({ message: "Запись удалена", affectedRows: result.affectedRows });
    });
});

// Получение данных из таблицы (по-прежнему доступно без авторизации)
app.get("/api/:table", (req, res) => {
    const table = req.params.table;

    const allowedTables = ["clients", "filmdatabase", "genre", "rental", "status", "tapes", "violations"];
    if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: "Таблица недоступна" });
    }

    connection.query(`SELECT * FROM ${table}`, (err, results) => {
        if (err) {
            console.error("Ошибка запроса:", err.message);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
        res.json(results);
    });
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
