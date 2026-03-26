import React, { useState, useEffect } from "react";
import logo from "../../../public/img/logo/TradeX logo png.png";
import './header.css';
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Проверяем авторизацию при загрузке страницы
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('balance');
    setUser(null);
    navigate('/auth'); // Перекидываем на вход после выхода
  };

  return (
    <div className="header">
      <div className="container headerContainer">
        <div className="left">
          <div className="logo">
            <Link to="/"><img src={logo} alt="TradeX" /></Link>
          </div>
        </div>
        <div className="center">
          <ul>
            <li className="centerLi"><Link to="/">Home</Link></li>
            <li className="centerLi"><Link to="/coins">Coins</Link></li>
            <li className="centerLi"><Link to="/convert">Convert</Link></li>
            <li className="centerLi"><Link to="/about">About</Link></li>
          </ul>
        </div>
        <div className="right">
          {user ? (
            // ЕСЛИ ПОЛЬЗОВАТЕЛЬ ВОШЕЛ
            <div className="profileSection">
              <Link to="/profile" className="profileLink">
                <div className="userAvatar">
                  {user.charAt(0).toUpperCase()}
                </div>
                <span>{user}</span>
              </Link>
              <button onClick={handleLogout} className="logoutBtn">Exit</button>
            </div>
          ) : (
            // ЕСЛИ НЕ ВОШЕЛ
            <>
              <div className="signBtn signinBtn">
                <Link className="signBtnLink" to={'/auth'}>Sign In</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;