import React, { createContext, useContext, useState } from 'react';

const TickerContext = createContext();

export const useTicker = () => useContext(TickerContext);

export const TickerProvider = ({ children }) => {
  const [ticker, setTicker] = useState(null);

  return (
    <TickerContext.Provider value={{ ticker, setTicker }}>
      {children}
    </TickerContext.Provider>
  );
};
