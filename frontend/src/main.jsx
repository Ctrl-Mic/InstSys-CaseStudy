import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChatPrompt from './modules/chatPrompt.jsx'
import Navigate from './components/navigate.jsx'
import Register from './modules/register.jsx'
import Login from './modules/login.jsx'
import Sample from './sample.jsx'
import Dashboard from './modules/dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <Sample/> */}
    <Navigate /> 
  </StrictMode>
)
