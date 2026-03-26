import React from "react";
import { useBinancePrice } from "../../Hooks/useBinancePrice"; // Убедись, что название хука совпадает
import "./coins.css";
import BitcoinImg from "../../../public/img/Coins/Bitcoin.png";
import EthereumImg from "../../../public/img/Coins/Ethereum.png";
import SolanaImg from "../../../public/img/Coins/Solana.png";
import XrpImg from "../../../public/img/Coins/Xrp.png";
import { Link } from "react-router-dom";

const Coins = () => {
  const coinsList = [
    // ТОП Классика
    "btcusdt",
    "ethusdt",
    "solusdt",
    "bnbusdt",
    "xrpusdt",
    "adausdt",
    "dotusdt",
    "avaxusdt",

    // Мемы (очень популярны сейчас)
    "dogeusdt",
    "shibusdt",
    "pepeusdt",
    "bonkusdt",
    "wifusdt",
    "flokiusdt",

    // Экосистема и L2
    "maticusdt",
    "arbustd",
    "opusdt",
    "linkusdt",
    "nearusdt",
    "aptusdt",
    "suiusdt",

    // AI и Технологии
    "rndrusdt",
    "fetusdt",
    "agixusdt",
    "ldousdt",
    "filusdt",

    // Старые добрые альткоины
    "ltcusdt",
    "bchusdt",
    "etcusdt",
    "xlmusdt",
    "trxusdt",
    "atomusdt",
  ];
  const prices = useBinancePrice(coinsList);

  // Функция для получения цвета в зависимости от направления
  const getPriceStyle = (coin) => ({
    color:
      prices[coin]?.direction === "up"
        ? "#00ff88"
        : prices[coin]?.direction === "down"
          ? "#ff4d4d"
          : "#000",
    transition: "color 0.3s ease",
  });

  return (
    <div className="coinsPage">
      <div className="container coinsContainer">
        <div className="topSection">
          {/* BTC */}
          <div className="topCoin">
            <div className="top">
              <div className="left">
                <img src={BitcoinImg} alt="BTC" />
              </div>
              <div className="right">
                <h3>BTC/USDT</h3>
              </div>
            </div>
            <div className="bottom">
              <p>
                Price:{" "}
                <span style={getPriceStyle("btcusdt")}>
                  ${prices["btcusdt"]?.price || "Загрузка..."}
                </span>
              </p>
            </div>
          </div>

          {/* ETH */}
          <div className="topCoin">
            <div className="top">
              <div className="left">
                <img src={EthereumImg} alt="ETH" />
              </div>
              <div className="right">
                <h3>ETH/USDT</h3>
              </div>
            </div>
            <div className="bottom">
              <p>
                Price:{" "}
                <span style={getPriceStyle("ethusdt")}>
                  ${prices["ethusdt"]?.price || "Загрузка..."}
                </span>
              </p>
            </div>
          </div>

          {/* SOL */}
          <div className="topCoin">
            <div className="top">
              <div className="left">
                <img src={SolanaImg} alt="SOL" />
              </div>
              <div className="right">
                <h3>SOL/USDT</h3>
              </div>
            </div>
            <div className="bottom">
              <p>
                Price:{" "}
                <span style={getPriceStyle("solusdt")}>
                  ${prices["solusdt"]?.price || "Загрузка..."}
                </span>
              </p>
            </div>
          </div>

          {/* XRP */}
          <div className="topCoin">
            <div className="top">
              <div className="left">
                <img src={XrpImg} alt="XRP" />
              </div>
              <div className="right">
                <h3>XRP/USDT</h3>
              </div>
            </div>
            <div className="bottom">
              <p>
                Price:{" "}
                <span style={getPriceStyle("xrpusdt")}>
                  ${prices["xrpusdt"]?.price || "Загрузка..."}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="marketSection">
          <h2>Рыночный обзор</h2>
          <div className="tableWrapper">
            <table className="marketTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Монета</th>
                  <th>Цена</th>
                  <th>24h Изменение</th>
                  <th>Торговать</th>
                </tr>
              </thead>
              <tbody>
                {coinsList.map((coin, index) => (
                  <tr key={coin}>
                    <td>{index + 1}</td>
                    <td className="coinNameCell">
                      <span className="symbol">
                        {coin.replace("usdt", "").toUpperCase()}
                      </span>
                      <span className="pair">/USDT</span>
                    </td>
                    <td style={getPriceStyle(coin)}>
                      {prices[coin] ? `$${prices[coin].price}` : "Загрузка..."}
                    </td>
                    <td
                      style={{
                        color:
                          prices[coin]?.direction === "up"
                            ? "#00ff88"
                            : "#ff4d4d",
                      }}
                    >
                      {prices[coin]?.direction === "up" ? "+0.52%" : "-1.15%"}
                      {/* Проценты пока статические, их можно взять из другого API позже */}
                    </td>
                    <td>
                      <Link to={`/trade/${coin}`}>
                        <button className="tradeBtn">Торговать</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coins;
