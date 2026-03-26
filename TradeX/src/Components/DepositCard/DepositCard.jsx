import React, { useState } from "react";
import axios from "axios";
import "./depositCard.css";

const DepositCard = ({ onClose, onSuccess }) => {
  const [card, setCard] = useState({
    number: "#### #### #### ####",
    holder: "NAME SURNAME",
    expiry: "MM/YY",
    cvv: "",
    amount: "",
  });

  const handleInput = (e, field) => {
    setCard({ ...card, [field]: e.target.value });
  };

  const handlePaySubmit = async () => {
    try {
      const res = await axios.post("https://tradex-api-64m5.onrender.com/api/deposit", {
        username: localStorage.getItem("user"),
        amount: parseFloat(card.amount),
      });

      // Вызываем функцию, которую передали из Profile.jsx
      onSuccess(res.data.newBalance);
      alert("Оплата прошла успешно!");
    } catch (err) {
      alert("Ошибка платежа");
    }
  };

  return (
    <div className="paymentOverlay">
      <div className="paymentModal">
        <button className="closeBtn" onClick={onClose}>
          &times;
        </button>

        {/* ВИЗУАЛЬНАЯ КАРТА */}
        <div className="visualCard">
          <div className="cardChip"></div>
          <div className="cardNumber">
            {card.number || "#### #### #### ####"}
          </div>
          <div className="cardBottom">
            <div className="cardHolder">
              <span>Card Holder</span>
              <p>{card.holder.toUpperCase()}</p>
            </div>
            <div className="cardExpiry">
              <span>Expires</span>
              <p>{card.expiry}</p>
            </div>
          </div>
        </div>

        {/* ФОРМА ВВОДА */}
        <form className="cardForm">
          <div className="inputBox">
            <span>Номер карты</span>
            <input
              type="text"
              maxLength="16"
              onChange={(e) => handleInput(e, "number")}
              placeholder="1234 5678 1234 5678"
            />
          </div>
          <div className="inputBox">
            <span>Владелец (LATIN)</span>
            <input
              type="text"
              onChange={(e) => handleInput(e, "holder")}
              placeholder="ARSEN ..."
            />
          </div>
          <div className="flexInput">
            <div className="inputBox">
              <span>Срок</span>
              <input
                type="text"
                maxLength="5"
                onChange={(e) => handleInput(e, "expiry")}
                placeholder="MM/YY"
              />
            </div>
            <div className="inputBox">
              <span>CVV</span>
              <input type="password" maxLength="3" placeholder="***" />
            </div>
          </div>
          <div className="inputBox">
            <span>Сумма пополнения (USDT)</span>
            <input
              type="number"
              className="amountInput"
              onChange={(e) => handleInput(e, "amount")}
              placeholder="0.00"
            />
          </div>
          <button
            type="button"
            className="paySubmitBtn"
            onClick={handlePaySubmit}
          >
            Пополнить баланс
          </button>
        </form>
      </div>
    </div>
  );
};

export default DepositCard;
