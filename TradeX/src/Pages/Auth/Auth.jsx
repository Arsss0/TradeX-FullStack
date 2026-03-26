import React, { useState } from 'react';
import axios from 'axios'; 
import './auth.css'

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true); // Переключатель Вход/Регистрация
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? 'https://tradex-api-64m5.onrender.com/api/signin' : 'https://tradex-api-64m5.onrender.com/api/signup';
    
    try {
        const res = await axios.post(url, formData);
        console.log("Ответ сервера:", res.data); // Посмотри в консоль (F12), что пришло!

        if (isLogin) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', res.data.username);
            alert(`Привет, ${res.data.username || 'Пользователь'}!`);
            window.location.href = '/trade/btcusdt';
        } else {
            // Если регистрации прошла успешно
            alert(res.data.message || "Регистрация успешна! Теперь войдите.");
            setIsLogin(true);
        }
    } catch (err) {
        // Если сервер выдал ошибку (например, 401 или 500)
        console.error("Ошибка запроса:", err.response);
        alert(err.response?.data?.error || "Произошла ошибка на сервере");
    }
};


    return (
        <div className="authPage">
            <div className="authCard">
                <h2>{isLogin ? 'Вход' : 'Создать аккаунт'}</h2>
                <p>{isLogin ? 'Добро пожаловать обратно!' : 'Начни торговать с $10,000 на счету'}</p>
                
                <form onSubmit={handleSubmit} className="authForm">
                    {!isLogin && (
                        <input 
                            className="inputField"
                            type="text" 
                            placeholder="Имя пользователя" 
                            onChange={(e) => setFormData({...formData, username: e.target.value})} 
                        />
                    )}
                    <input 
                        className="inputField"
                        type="email" 
                        placeholder="Электронная почта" 
                        required 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                    <input 
                        className="inputField"
                        type="password" 
                        placeholder="Пароль" 
                        required 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                    <button type="submit" className="authBtn">
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="switchText">
                    {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
                    <span className="switchLink" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Создать' : 'Войти'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Auth;