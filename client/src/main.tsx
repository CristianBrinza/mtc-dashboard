import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {NotificationProvider} from "./components/Notification/NotificationContext.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <NotificationProvider>
    <App />
      </NotificationProvider>
  </StrictMode>,
)
