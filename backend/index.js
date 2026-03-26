const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Чтобы React мог достучаться до сервера
app.use(express.json()); // Чтобы сервер понимал JSON

// Подключаемся к базе данных
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // В XAMPP по умолчанию root
  password: '',      // В XAMPP по умолчанию пусто
  database: 'crypto_db'
});

db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к MySQL:', err);
  } else {
    console.log('Ура! Мы подключились к базе данных.');
  }
});

// Простой проверочный маршрут
app.get('/', (req, res) => {
  res.send('Сервер биржи запущен!');
});

app.listen(5000, () => {
  console.log('Бэкенд работает на https://tradex-api-64m5.onrender.com');
});