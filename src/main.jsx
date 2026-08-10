import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import './styles/index.css';
import './styles/navigation.css';
import './styles/pdfControls.css';
import './styles/persistence.css';
import './styles/platformAdmin.css';
import './styles/platformAdminManagement.css';
import './styles/platformAdminFunctional.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);