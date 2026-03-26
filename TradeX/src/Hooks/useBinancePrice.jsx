import { useState, useEffect, useRef } from 'react';

export const useBinancePrice = (symbols = ['btcusdt']) => {
  const [prices, setPrices] = useState({});
  const prevPrices = useRef({});

  useEffect(() => {
    const streams = symbols.map(s => `${s.toLowerCase()}@trade`).join('/');
    const socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    socket.onmessage = (event) => {
      const { data } = JSON.parse(event.data);
      const symbol = data.s.toLowerCase();
      const newPrice = parseFloat(data.p).toFixed(2);

      setPrices((prev) => {
        prevPrices.current[symbol] = prev[symbol]?.price || null;
        return {
          ...prev,
          [symbol]: {
            price: newPrice,
            direction: newPrice > prevPrices.current[symbol] ? 'up' : 
                       newPrice < prevPrices.current[symbol] ? 'down' : 'stable'
          }
        };
      });
    };

    return () => socket.close();

  // ВОТ ЭТА СТРОЧКА:
  }, [JSON.stringify(symbols)]); 

  return prices;
};