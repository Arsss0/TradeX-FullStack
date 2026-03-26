const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crypto_db',
    port: process.env.DB_PORT || 3306
});

// Проверка подключения
db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err.message);
    } else {
        console.log('Успешное подключение к базе данных! ✅');
    }
});

const SECRET_KEY = "my_super_secret_key_123";

// --- РЕГИСТРАЦИЯ И ВХОД (БЕЗ ИЗМЕНЕНИЙ) ---
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: "Пользователь уже существует или ошибка БД" });
        res.status(201).json({ message: "Успешная регистрация! Мы подарили вам $10,000" });
    });
});

app.post('/api/signin', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: "Пользователь не найден" });
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1d' });
            res.json({ token, username: user.username, balance: user.balance });
        } else {
            res.status(401).json({ error: "Неверный пароль" });
        }
    });
});

// --- РАБОТА С БАЛАНСОМ (БЕЗ ИЗМЕНЕНИЙ) ---
app.get('/api/user/:username', (req, res) => {
    const username = req.params.username;
    db.query("SELECT balance, btc_balance FROM users WHERE username = ?", [username], (err, results) => {
        if (err || results.length === 0) return res.status(500).send("User not found");
        res.json(results[0]);
    });
});

// --- ФЬЮЧЕРСЫ: ОТКРЫТИЕ ПОЗИЦИИ (ИСПРАВЛЕНО) ---
app.post('/api/futures/open', (req, res) => {
    const { username, coin, margin, leverage, size, entryPrice, type } = req.body;

    // 1. Проверяем баланс
    db.query("SELECT balance FROM users WHERE username = ?", [username], (err, result) => {
        if (err) return res.status(500).json({ error: "Ошибка БД" });
        if (result.length === 0) return res.status(404).json({ error: "Пользователь не найден" });
        
        const currentBalance = parseFloat(result[0].balance);
        if (currentBalance < margin) return res.status(400).json({ error: "Недостаточно средств для маржи" });

        // 2. Списываем маржу
        db.query("UPDATE users SET balance = balance - ? WHERE username = ?", [margin, username], (updErr) => {
            if (updErr) return res.status(500).json({ error: "Ошибка списания баланса" });

            // 3. Создаем позицию
            const sql = "INSERT INTO positions (username, coin, margin, leverage, size, entry_price, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'open')";
            db.query(sql, [username, coin, margin, leverage, size, entryPrice, type], (insErr) => {
                if (insErr) {
                    console.error("ОШИБКА SQL ПРИ INSERT:", insErr);
                    return res.status(500).json({ error: "Ошибка записи позиции. Проверь таблицу!" });
                }
                res.json({ message: "Фьючерсная позиция открыта!" });
            });
        });
    });
});

// --- ФЬЮЧЕРСЫ: ПОЛУЧЕНИЕ ПОЗИЦИЙ ---
app.get('/api/positions/:username', (req, res) => {
    const username = req.params.username;
    const sql = "SELECT * FROM positions WHERE username = ? AND status = 'open'";
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// --- ФЬЮЧЕРСЫ: ЗАКРЫТИЕ ПОЗИЦИИ ---
app.post('/api/futures/close', (req, res) => {
    const { positionId, username, pnl } = req.body;

    db.query("SELECT margin FROM positions WHERE id = ? AND username = ? AND status = 'open'", [positionId, username], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ error: "Позиция не найдена" });

        const margin = parseFloat(rows[0].margin);
        const totalReturn = margin + parseFloat(pnl);

        db.query("UPDATE users SET balance = balance + ? WHERE username = ?", [totalReturn, username], (updErr) => {
            if (updErr) return res.status(500).json({ error: "Ошибка возврата средств" });

            db.query("UPDATE positions SET status = 'closed' WHERE id = ?", [positionId], () => {
                res.json({ message: "Позиция закрыта!", payout: totalReturn.toFixed(2) });
            });
        });
    });
});

// --- СПОТ ТОРГОВЛЯ (ОБЫЧНАЯ) ---
app.post('/api/trade', (req, res) => {
    const { username, coin, type, amount, price } = req.body;
    const totalCost = amount * price;

    db.query("SELECT balance, btc_balance FROM users WHERE username = ?", [username], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ error: "Ошибка БД" });
        const { balance, btc_balance } = rows[0];

        if (type === 'buy') {
            if (balance < totalCost) return res.status(400).json({ error: "Недостаточно USDT!" });
            db.query("UPDATE users SET balance = balance - ?, btc_balance = btc_balance + ? WHERE username = ?", [totalCost, amount, username], (err) => {
                if (err) return res.status(500).json({ error: "Ошибка сделки" });
                res.json({ message: "Покупка успешна!", newBalance: balance - totalCost });
            });
        } else {
            if (btc_balance < amount) return res.status(400).json({ error: "Недостаточно монет!" });
            db.query("UPDATE users SET balance = balance + ?, btc_balance = btc_balance - ? WHERE username = ?", [totalCost, amount, username], (err) => {
                if (err) return res.status(500).json({ error: "Ошибка сделки" });
                res.json({ message: "Продажа успешна!", newBalance: balance + totalCost });
            });
        }
    });
});

app.post('/api/futures/liquidate', (req, res) => {
    const { positionId, username } = req.body;

    // Просто помечаем позицию как ликвидированную (status: liquidated)
    // Деньги на баланс НЕ возвращаем!
    db.query("UPDATE positions SET status = 'liquidated' WHERE id = ? AND username = ?", [positionId, username], (err) => {
        if (err) return res.status(500).json({ error: "Ошибка при ликвидации" });
        
        res.json({ message: "Позиция ликвидирована! Баланс потерян." });
    });
});

app.get('/api/history/:username', (req, res) => {
    const username = req.params.username;
    // Тянем сделки, которые НЕ 'open'
    const sql = "SELECT * FROM positions WHERE username = ? AND status != 'open' ORDER BY created_at DESC LIMIT 20";
    
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});


// РОУТ ДЛЯ ПОПОЛНЕНИЯ БАЛАНСА (DEPOSIT)
app.post('/api/deposit', (req, res) => {
    const { username, amount } = req.body;

    if (!username || !amount || amount <= 0) {
        return res.status(400).json({ message: "Неверные данные депозита" });
    }

    // 1. Сначала проверяем, существует ли пользователь
    const checkUser = "SELECT balance FROM users WHERE username = ?";
    db.query(checkUser, [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Пользователь не найден" });

        const currentBalance = parseFloat(results[0].balance);
        const newBalance = currentBalance + parseFloat(amount);

        // 2. Обновляем баланс в базе
        const updateBalance = "UPDATE users SET balance = ? WHERE username = ?";
        db.query(updateBalance, [newBalance, username], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: updateErr.message });

            console.log(`Баланс пользователя ${username} пополнен на ${amount}. Новый баланс: ${newBalance}`);
            res.json({ 
                message: "Депозит успешно зачислен!", 
                newBalance: newBalance 
            });
        });
    });
});















app.use(cors({ origin: '*' }));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`))