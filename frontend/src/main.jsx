import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AppUiProvider } from './context/AppUiContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AppUiProvider>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                className:
                  '!rounded-xl !border !border-slate-200/80 !bg-white/95 !text-slate-800 !shadow-xl !backdrop-blur-xl dark:!border-slate-700/80 dark:!bg-slate-900/95 dark:!text-slate-100',
                duration: 4000,
                style: { fontSize: '14px' },
              }}
            />
          </AuthProvider>
        </AppUiProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
