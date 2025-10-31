import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/app.jsx'
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';
import { SplitText } from "gsap/all";
import './index.css'

gsap.registerPlugin(SplitText);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> 
  </StrictMode>
)
