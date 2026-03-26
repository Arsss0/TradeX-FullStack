import React from "react";
import "./home.css";
import homephonetrade from "../../../public/img/homephonetrade.png";
import btcstack from "../../../public/img/btcstack.png";
import moneyearn from "../../../public/img/moneyearn.png";

const Home = () => {
  return (
    <div className="home">
      <div className="homeContainer container">
        <section className="heroSection">
          <div className="heroContent">
            <h1 className="gradientText">
              Торгуй будущим <br /> уже сегодня
            </h1>
            <h2>TradeX — твои ворота в мир цифровых активов</h2>
            <p>
              Покупай, продавай и конвертируй криптовалюту с минимальной
              комиссией. Безопасность и скорость в каждом клике.
            </p>
            <div className="heroButtons">
              <button
                className="mainBtn"
                onClick={() => (window.location.href = "/auth")}
              >
                Начать работу
              </button>
              <button
                className="secondaryBtn"
                onClick={() => (window.location.href = "/about")}
              >
                Узнать больше
              </button>
            </div>
          </div>
          <div className="heroImage">
            <img src={btcstack} alt="Crypto Trading"/>
          </div>
        </section>
        <div className="section3">
          <div className="left">
            <img src={moneyearn} alt="" />
          </div>
          <div className="right">
            <h2>
              <a href={"/auth"}>Готовы войти в рынок?</a>
            </h2>
            <p>
              Присоединяйтесь к тысячам трейдеров. Создайте аккаунт и начните
              торговать BTC за считанные минуты
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
