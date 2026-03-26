import React from "react";
import "./about.css";
import logo from "../../../public/img/logo/TradeX logo png.png";

const About = () => {
  const stats = [
    { label: "Пользователей", value: "10K+" },
    { label: "Торговый объем", value: "$50M+" },
    { label: "Крипто-активов", value: "100+" },
  ];

  return (
    <div className="aboutPage">
      <div className="container aboutContainer">
        
        <header className="aboutHeader">
          <img src={logo} alt="TradeX Logo" className="aboutLogo" />
          <h1>Будущее трейдинга уже здесь</h1>
          <p>TradeX — это инновационная платформа для обмена и управления цифровыми активами, созданная для трейдеров нового поколения.</p>
        </header>

        <section className="statsGrid">
          {stats.map((item, index) => (
            <div key={index} className="statCard">
              <h2>{item.value}</h2>
              <span>{item.label}</span>
            </div>
          ))}
        </section>

        <section className="aboutContent">
          <div className="infoBlock">
            <h3>Наша миссия</h3>
            <p>
              Мы стремимся сделать финансовую свободу доступной каждому. 
              Наша платформа объединяет в себе мощные инструменты профессионального 
              трейдинга и простоту интерфейса для новичков.
            </p>
          </div>

          <div className="featuresGrid">
            <div className="featureItem">
              <div className="featureIcon">🔒</div>
              <h4>Безопасность</h4>
              <p>Мы используем многоуровневое шифрование и холодное хранение активов.</p>
            </div>
            <div className="featureItem">
              <div className="featureIcon">⚡</div>
              <h4>Скорость</h4>
              <p>Исполнение ордеров за миллисекунды благодаря нашему ядру обработки данных.</p>
            </div>
            <div className="featureItem">
              <div className="featureIcon">📱</div>
              <h4>Доступность</h4>
              <p>Управляйте своим портфелем с любого устройства в любой точке мира.</p>
            </div>
          </div>
        </section>

        <footer className="aboutFooter">
          <button className="startTradingBtn" onClick={() => window.location.href='/auth'}>
            Начать торговать сейчас
          </button>
          </footer>
        </div>
      </div>
    
  );
};

export default About;