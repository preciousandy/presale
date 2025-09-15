import { StrictMode } from 'react'
import { AuthProvider } from './context/AuthContext'; 
import { BrowserRouter as Router } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <Router>
      <AuthProvider>
          <App />
      </AuthProvider>
  </Router>
</StrictMode>
)
