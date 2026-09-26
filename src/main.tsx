import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n/I18nProvider';
import { HardwareProfileProvider } from './context/HardwareProfileContext';
import { FinancialStateProvider } from './context/FinancialStateContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HardwareProfileProvider>
      <FinancialStateProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </FinancialStateProvider>
    </HardwareProfileProvider>
  </React.StrictMode>,
);
