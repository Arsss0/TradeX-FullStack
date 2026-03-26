import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useBinancePrice } from "../../Hooks/useBinancePrice";
import "./trade.css";
import { toast } from 'react-toastify';

// Виджет графика TradingView
const TradingChart = ({ symbol }) => {
  const container = useRef();
  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${symbol.toUpperCase()}`,
      interval: "D",
      theme: "light",
      style: "1",
      locale: "ru",
      allow_symbol_change: true,
      support_host: "https://www.tradingview.com",
    });
    container.current.appendChild(script);
  }, [symbol]);
  return <div ref={container} style={{ height: "100%", width: "100%" }} />;
};

const Trade = () => {
  const [history, setHistory] = useState([]); // Состояние для истории
const [activeTab, setActiveTab] = useState("positions"); // "positions" или "history"
  const [positions, setPositions] = useState([]);
  const { coinId } = useParams();
  const coin = coinId || "btcusdt";
  const prices = useBinancePrice([coin]);

  const [amount, setAmount] = useState(""); // Вводимая сумма (USDT для фьючерсов / Колич. для спота)
  const [userBalance, setUserBalance] = useState(localStorage.getItem("balance") || "0");
  const [tradeMode, setTradeMode] = useState("spot");
  const [leverage, setLeverage] = useState(1);

  const currentPriceRaw = prices[coin]?.price || "0";
  const currentPrice = parseFloat(currentPriceRaw.replace(/,/g, ""));

  // РАСЧЕТЫ ДЛЯ ИНТЕРФЕЙСА
  const marginRequired = tradeMode === "futures" 
    ? (amount ? parseFloat(amount).toFixed(2) : "0.00") // Для фьючерсов вводим маржу напрямую
    : (amount && currentPrice ? (parseFloat(amount) * currentPrice).toFixed(2) : "0.00");

  const liquidationPrice = tradeMode === "futures" && leverage > 1 && currentPrice
    ? (currentPrice * (1 - 1 / leverage)).toFixed(2) 
    : "—";

  // Загрузка данных пользователя
  const fetchUserData = async () => {
    try {
      const username = localStorage.getItem("user");
      if (!username) return;
      const res = await axios.get(`https://tradex-api-64m5.onrender.com/api/user/${username}`);
      setUserBalance(res.data.balance);
      localStorage.setItem("balance", res.data.balance);
    } catch (err) {
      console.error("Ошибка обновления баланса", err);
    }
  };

  // Загрузка открытых позиций
  const fetchPositions = async () => {
    try {
      const username = localStorage.getItem("user");
      if (!username) return;
      const res = await axios.get(`https://tradex-api-64m5.onrender.com/api/positions/${username}`);
      setPositions(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке позиций:", err);
    }
  };

  useEffect(() => {
    fetchPositions();
    fetchUserData();
  }, [coin]);

  // ТОРГОВЛЯ НА СПОТЕ (ОБЫЧНАЯ)
  const handleTrade = async (type) => {
    if (!amount || amount <= 0) return toast.warning("Введите количество монет");
    if (!currentPrice) return toast.warning("Ожидание цены...");

    const username = localStorage.getItem("user");
    try {
      const res = await axios.post(`https://tradex-api-64m5.onrender.com/api/trade`, {
        username,
        coin,
        type, 
        amount: parseFloat(amount),
        price: currentPrice,
      });
      toast.success(res.data.message);
      fetchUserData();
      setAmount("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Ошибка транзакции");
    }
  };

  // ТОРГОВЛЯ НА ФЬЮЧЕРСАХ
  const handleFuturesTrade = async (direction) => {
    if (!amount || amount <= 0) return toast.warning("Введите сумму маржи!");
    if (!currentPrice) return toast.warning("Ожидание цены...");

    const username = localStorage.getItem("user");
    // Размер позиции (контракта) = (Маржа * Плечо) / Цена входа
    const size = (parseFloat(amount) * leverage) / currentPrice;

    try {
        const res = await axios.post("https://tradex-api-64m5.onrender.com/api/futures/open", {
            username,
            coin,
            margin: parseFloat(amount),
            leverage,
            size,
            entryPrice: currentPrice,
            type: direction
        });

        toast.info(`Позиция ${direction.toUpperCase()} открыта!`, {
            icon: direction === 'long' ? "📈" : "📉"
        });

        fetchPositions();
        fetchUserData();
        setAmount("");
    } catch (err) {
        toast.error(err.response?.data?.error || "Ошибка открытия");
    }
  };

  // ЗАКРЫТИЕ ФЬЮЧЕРСНОЙ ПОЗИЦИИ
  const handleClosePosition = async (id, currentPnl) => {
    const username = localStorage.getItem("user");
    try {
        const res = await axios.post("https://tradex-api-64m5.onrender.com/api/futures/close", {
            positionId: id,
            username: username,
            pnl: currentPnl
        });
        toast.success(`Позиция закрыта! На счет: +${res.data.payout} USDT`, { icon: "💰" });
        fetchPositions(); 
        fetchUserData();  
    } catch (err) {
        toast.error("Ошибка при закрытии позиции");
    }
  };

  const priceStyle = {
    color: prices[coin]?.direction === "up" ? "#03a66d" : prices[coin]?.direction === "down" ? "#cf304a" : "#1e2329",
    fontWeight: "bold",
    fontSize: "24px",
    };


    useEffect(() => {
    if (positions.length > 0 && currentPrice > 0) {
        positions.forEach(async (pos) => {
            if (pos.status !== 'open') return;

            // Считаем цену ликвидации для каждой позиции
            // Для Long: входим по 100, плечо 10х -> ликва на 90
            // Для Short: входим по 100, плечо 10х -> ликва на 110
            const liqPrice = pos.type === 'long'
                ? pos.entry_price * (1 - 1 / pos.leverage)
                : pos.entry_price * (1 + 1 / pos.leverage);

            const isLiquidated = pos.type === 'long' 
                ? currentPrice <= liqPrice 
                : currentPrice >= liqPrice;

            if (isLiquidated) {
                handleLiquidation(pos.id);
            }
        });
    }
}, [currentPrice, positions]);

const handleLiquidation = async (id) => {
    const username = localStorage.getItem("user");
    try {
        await axios.post("https://tradex-api-64m5.onrender.com/api/futures/liquidate", {
            positionId: id,
            username: username
        });
        
        // Красное уведомление о потере денег
        toast.error("⚡ ЛИКВИДАЦИЯ! Ваша позиция закрыта в ноль.", {
            position: "top-center",
            autoClose: 10000, // Чтобы юзер успел расстроиться
        });

        fetchPositions(); // Обновляем таблицу (позиция исчезнет)
        fetchUserData();  // Обновляем баланс (на всякий случай)
    } catch (err) {
        console.error("Ошибка ликвидации:", err);
    }
};

const fetchHistory = async () => {
    try {
        const username = localStorage.getItem("user");
        const res = await axios.get(`https://tradex-api-64m5.onrender.com/api/history/${username}`);
        setHistory(res.data);
    } catch (err) {
        console.error("Ошибка загрузки истории:", err);
    }
};

// Обновляем useEffect, чтобы он грузил историю при смене таба
useEffect(() => {
    if (activeTab === "history") {
        fetchHistory();
    }
}, [activeTab]);


























  return (
    <div className="tradePage">
      <div className="container tradeContainer">
        
        {/* ЛЕВАЯ КОЛОНКА: ГРАФИК */}
        <div className="chartSection">
          <div className="tradeHeader">
            <div className="coinInfo">
              <h2>{coin.replace("usdt", "").toUpperCase()} / USDT</h2>
              <span style={priceStyle}>${currentPriceRaw}</span>
            </div>
            <div className="modeSelector">
              <button className={tradeMode === "spot" ? "active" : ""} onClick={() => setTradeMode("spot")}>Spot</button>
              <button className={tradeMode === "futures" ? "active" : ""} onClick={() => setTradeMode("futures")}>Futures</button>
            </div>
          </div>
          <div className="mainChart">
            <TradingChart symbol={coin} />
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ТЕРМИНАЛ */}
        <div className="orderSection">
          <div className="orderBox">
            <h3>{tradeMode === "spot" ? "Spot Trading" : `Futures (Cross x${leverage})`}</h3>
            
            <div className="balanceLabel">
              Wallet: <strong>{parseFloat(userBalance).toFixed(2)} USDT</strong>
            </div>

            {tradeMode === "futures" && (
              <div className="leverageSection" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#707a8a' }}>Leverage: {leverage}x</label>
                <input
                  type="range" min="1" max="100" value={leverage} style={{ width: '100%' }}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                />
              </div>
            )}

            <div className="inputGroup">
              <label>Price</label>
              <input type="text" value={currentPriceRaw} readOnly />
            </div>

            <div className="inputGroup">
              <label>{tradeMode === "spot" ? `Amount (${coin.replace("usdt", "").toUpperCase()})` : "Margin (USDT)"}</label>
              <input
                type="number" placeholder="0.00" value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="tradeInfoBlock">
              <div className="infoRow">
                <span>{tradeMode === "spot" ? "Total Cost:" : "Margin (Cost):"}</span>
                <span>{marginRequired} USDT</span>
              </div>
              {tradeMode === "futures" && (
                <div className="infoRow">
                  <span>Est. Liquidation:</span>
                  <span style={{ color: "#cf304a" }}>{liquidationPrice} USDT</span>
                </div>
              )}
            </div>

            {tradeMode === "spot" ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="executeBtn buy" onClick={() => handleTrade("buy")}>Buy</button>
                <button className="executeBtn sell" onClick={() => handleTrade("sell")}>Sell</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="executeBtn buy" onClick={() => handleFuturesTrade("long")}>Open Long</button>
                <button className="executeBtn sell" onClick={() => handleFuturesTrade("short")}>Open Short</button>
              </div>
            )}
          </div>

          <div className="miniOrderBook">
             <h3>Order Book</h3>
             <div className="bookPrice" style={priceStyle}>${currentPriceRaw}</div>
             <p style={{ fontSize: "11px", color: "#707a8a", textAlign: "center" }}>Live connecting to Binance...</p>
          </div>
        </div>  

        {/* --- НИЖНЯЯ ПАНЕЛЬ: ПОЗИЦИИ И ИСТОРИЯ --- */}
        <div className="positionsSection container" style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
          
          {/* Переключатель вкладок */}
          <div className="positionsTabs" style={{ display: 'flex', gap: '20px', marginBottom: '15px', borderBottom: '1px solid #dee2e6' }}>
            <button 
              className={`posTab ${activeTab === "positions" ? "active" : ""}`} 
              onClick={() => setActiveTab("positions")}
              style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', background: 'none', fontWeight: activeTab === 'positions' ? 'bold' : 'normal', borderBottom: activeTab === 'positions' ? '2px solid #f0b90b' : 'none' }}
            >
              Open Positions ({positions.length})
            </button>
            <button 
              className={`posTab ${activeTab === "history" ? "active" : ""}`} 
              onClick={() => setActiveTab("history")}
              style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', background: 'none', fontWeight: activeTab === 'history' ? 'bold' : 'normal', borderBottom: activeTab === 'history' ? '2px solid #f0b90b' : 'none' }}
            >
              Trade History
            </button>
          </div>

          <div className="positionsTableContainer">
            {activeTab === "positions" ? (
              /* ТАБЛИЦА АКТИВНЫХ ПОЗИЦИЙ */
              <table className="positionsTable" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#707a8a', fontSize: '12px' }}>
                    <th>Contract</th>
                    <th>Size</th>
                    <th>Entry Price</th>
                    <th>Mark Price</th>
                    <th>PnL (ROE %)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.length > 0 ? (
                    positions.map((pos) => {
                      // Считаем PnL в реальном времени
                      const pnl = pos.type === "long"
                          ? (currentPrice - pos.entry_price) * pos.size
                          : (pos.entry_price - currentPrice) * pos.size;
                      const roe = (pnl / pos.margin) * 100;

                      return (
                        <tr key={pos.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                          <td style={{ padding: '12px 0', fontWeight: 'bold' }}>
                            {pos.coin.toUpperCase()} 
                            <span style={{ fontSize: '10px', marginLeft: '5px', color: pos.type === 'long' ? '#03a66d' : '#cf304a' }}>
                              {pos.type.toUpperCase()} {pos.leverage}x
                            </span>
                          </td>
                          <td>{parseFloat(pos.size).toFixed(4)}</td>
                          <td>{parseFloat(pos.entry_price).toFixed(2)}</td>
                          <td>{currentPrice.toFixed(2)}</td>
                          <td className={pnl >= 0 ? "pnl-plus" : "pnl-minus"} style={{ color: pnl >= 0 ? '#03a66d' : '#cf304a', fontWeight: 'bold' }}>
                            {pnl.toFixed(2)} USDT ({roe.toFixed(2)}%)
                          </td>
                          <td>
                            <button 
                              className="closePosBtn" 
                              onClick={() => handleClosePosition(pos.id, pnl)}
                              style={{ padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #dee2e6' }}
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: '#707a8a' }}>No active positions</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              /* ТАБЛИЦА ИСТОРИИ */
              <table className="positionsTable" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#707a8a', fontSize: '12px' }}>
                    <th>Time</th>
                    <th>Contract</th>
                    <th>Type</th>
                    <th>Leverage</th>
                    <th>Margin</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((h) => (
                      <tr key={h.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                        <td style={{ padding: '12px 0', fontSize: '12px', color: '#707a8a' }}>
                          {new Date(h.created_at).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 'bold' }}>{h.coin.toUpperCase()}</td>
                        <td style={{ color: h.type === 'long' ? '#03a66d' : '#cf304a' }}>
                          {h.type.toUpperCase()}
                        </td>
                        <td>{h.leverage}x</td>
                        <td>{parseFloat(h.margin).toFixed(2)} USDT</td>
                        <td>
                          <span style={{ 
                            padding: '3px 8px', 
                            borderRadius: '4px', 
                            fontSize: '10px',
                            fontWeight: 'bold',
                            background: h.status === 'liquidated' ? '#cf304a' : '#f1f3f5',
                            color: h.status === 'liquidated' ? '#fff' : '#1e2329'
                          }}>
                            {h.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: '#707a8a' }}>Your history is empty</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        </div>
    </div>
  );
};

export default Trade;