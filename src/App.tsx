import React from 'react';
import AppRouter from './routes/AppRouter';
import { HistoryProvider } from './contexts/HistoryContext';
import { PurchaseProvider } from './contexts/PurchaseContext';
import { RoleProvider } from './contexts/RoleContext';
import { WalletProvider } from './contexts/WalletContext';
import './App.css';

function App() {
  return (
    <WalletProvider>
      <HistoryProvider>
        <PurchaseProvider>
          <RoleProvider>
            <AppRouter />
          </RoleProvider>
        </PurchaseProvider>
      </HistoryProvider>
    </WalletProvider>
  );
}

export default App;
