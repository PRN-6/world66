import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RobotConstructionScene } from './RobotConstructionScene'
import '../index.css'
createRoot(document.getElementById('root')!).render(<StrictMode><RobotConstructionScene/></StrictMode>)
