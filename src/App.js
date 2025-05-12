import React from 'react';
import BankManagementSystem from './components/BankManagementSystem';
import { ToastProvider } from './components/ToastContext';

function App() {
  return (
    <ToastProvider>
      <div className="App">
        <BankManagementSystem />
      </div>
    </ToastProvider>
  );
}

export default App; 