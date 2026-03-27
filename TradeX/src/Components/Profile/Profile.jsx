import axios from "axios";
import React, { useState, useEffect } from "react";
import DepositCard from "../DepositCard/DepositCard"; 
import "./profile.css";

const coinsList = [
  "btcusdt", "ethusdt", "solusdt", "bnbusdt", "xrpusdt", "adausdt", "dotusdt", "avaxusdt",
  "dogeusdt", "shibusdt", "pepeusdt", "nearusdt", "linkusdt", "trxusdt"
];

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({
    username: localStorage.getItem("user") || "User",
    balance: "0",
    // Теперь храним все балансы в одном объекте
    balances: {} 
  });

  const fetchUserData = async () => {
    try {
      const username = localStorage.getItem("user");
      if (!username) return;

      const res = await axios.get(`https://tradex-api-64m5.onrender.com/api/user/${username}`);
      
      setUser({
        username: username,
        balance: res.data.balance || "0",
        // Сохраняем весь объект данных из базы (там будут btc_balance, eth_balance и т.д.)
        balances: res.data 
      });

      localStorage.setItem("balance", res.data.balance);
    } catch (err) {
      console.error("Ошибка при получении данных пользователя:", err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleWithdraw = async () => {
    const amount = window.prompt("Введите сумму для вывода (USDT):");
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      try {
        const res = await axios.post("https://tradex-api-64m5.onrender.com/api/withdraw", {
          username: user.username,
          amount: parseFloat(amount),
        });
        alert(res.data.message);
        fetchUserData(); 
      } catch (err) {
        alert(err.response?.data?.error || "Ошибка сервера");
      }
    }
  };

  const handleDepositSuccess = () => {
    setIsModalOpen(false);
    fetchUserData();
  };

  const assets = coinsList.map((symbol) => {
    const coinShort = symbol.replace("usdt", ""); // 'btc', 'eth'
    const coinName = coinShort.toUpperCase(); // 'BTC', 'ETH'
    
    // ДИНАМИЧЕСКИЙ ПОИСК БАЛАНСА:
    // Ищем в объекте balances поле типа 'eth_balance'
    const dbColumnName = `${coinShort}_balance`;
    const amountValue = user.balances[dbColumnName] || "0.00";
    
    const stringToColor = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return `hsl(${hash % 360}, 70%, 50%)`;
    };

    return {
      coin: coinName,
      symbol: coinName,
      // Для BTC 8 знаков, для остальных 4 (или 2)
      amount: parseFloat(amountValue).toFixed(coinName === "BTC" ? 8 : 4),
      color: coinName === "BTC" ? "#f3ba2f" : stringToColor(coinName)
    };
  });

  return (
    <div className="profilePage">
      <div className="container profileContainer">
        
        <div className="balanceCard">
          <div className="balanceInfo">
            <span>Общий баланс счета</span>
            <h1>
              ${parseFloat(user.balance).toLocaleString()} <small>USDT</small>
            </h1>
            <p>Добро пожаловать, {user.username}!</p>
          </div>
          <div className="balanceActions">
            <button className="actionBtn deposit" onClick={() => setIsModalOpen(true)}>
              Deposit
            </button>
            <button className="actionBtn withdraw" onClick={handleWithdraw}>
              Withdraw
            </button>
          </div>
        </div>

        <div className="assetsSection">
          <h3>Мои активы</h3>
          <div className="assetsTableContainer">
            <table className="assetsTable">
              <thead>
                <tr>
                  <th>Актив</th>
                  <th>Количество</th>
                  <th>Статус</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="assetName">
                      <div className="assetIcon usdt">S</div>
                      <strong>Tether <span>USDT</span></strong>
                    </div>
                  </td>
                  <td>{parseFloat(user.balance).toFixed(2)}</td>
                  <td style={{color: '#03a66d'}}>Active</td>
                  <td><button className="tableTradeBtn" onClick={() => window.location.href='/trade/btcusdt'}>Trade</button></td>
                </tr>

                {assets.map((asset) => (
                  <tr key={asset.symbol}>
                    <td>
                      <div className="assetName">
                        <div className="assetIcon" style={{ backgroundColor: asset.color }}>
                          {asset.symbol[0]}
                        </div>
                        <strong>{asset.coin} <span>{asset.symbol}</span></strong>
                      </div>
                    </td>
                    <td>{asset.amount}</td>
                    <td>{parseFloat(asset.amount) > 0 ? "Hold" : "Empty"}</td>
                    <td>
                      <button 
                        className="tableTradeBtn" 
                        onClick={() => window.location.href=`/trade/${asset.symbol.toLowerCase()}usdt`}
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <DepositCard 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={handleDepositSuccess} 
          />
        )}
      </div>
    </div>
  );
};

export default Profile;