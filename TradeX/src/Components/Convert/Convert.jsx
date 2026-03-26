import React, { useState, useEffect } from "react";
import axios from "axios";
import { useBinancePrice } from "../../Hooks/useBinancePrice";
import "./convert.css";

const Convert = () => {
  const [fromCoin, setFromCoin] = useState("USDT");
  const [toCoin, setToCoin] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(0);
  
  const prices = useBinancePrice(["btcusdt"]);
  const btcPrice = parseFloat(prices["btcusdt"]?.price.replace(/,/g, "")) || 0;

  // Автоматический расчет результата при вводе
  useEffect(() => {
    if (!amount || btcPrice === 0) {
      setResult(0);
      return;
    }
    if (fromCoin === "USDT") {
      setResult((amount / btcPrice).toFixed(8));
    } else {
      setResult((amount * btcPrice).toFixed(2));
    }
  }, [amount, fromCoin, btcPrice]);

  const handleSwap = () => {
    setFromCoin(toCoin);
    setToCoin(fromCoin);
    setAmount("");
  };

  const handleConvert = async () => {
    if (!amount || amount <= 0) return alert("Введите сумму");
    
    try {
      const res = await axios.post("https://tradex-api-64m5.onrender.com/api/convert", {
        username: localStorage.getItem("user"),
        fromCoin,
        toCoin,
        amount: parseFloat(amount),
        price: btcPrice
      });
      alert(res.data.message);
      setAmount("");
    } catch (err) {
      alert(err.response?.data?.error || "Ошибка сервера");
    }
  };

  return (
    <div className="convertPage">
      <div className="convertBox">
        <h2>Быстрая конвертация</h2>
        
        <div className="inputBlock">
          <label>Отдаете ({fromCoin})</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="0.00"
          />
        </div>

        <button className="swapBtn" onClick={handleSwap}>⇅</button>

        <div className="inputBlock">
          <label>Получаете ({toCoin})</label>
          <input type="text" value={result} readOnly />
        </div>

        <div className="priceInfo">
          Курс: 1 BTC = {btcPrice.toLocaleString()} USDT
        </div>

        <button className="convertSubmitBtn" onClick={handleConvert}>
          Конвертировать
        </button>
      </div>
    </div>
  );
};

export default Convert;