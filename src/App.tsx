import React from 'react';
import AppRouter from './routes/AppRouter';
import { HistoryProvider } from './contexts/HistoryContext';
import { PurchaseProvider } from './contexts/PurchaseContext';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <HistoryProvider>
      <PurchaseProvider>
        <AppRouter />
      </PurchaseProvider>
    </HistoryProvider>
  );
}

export default App;
