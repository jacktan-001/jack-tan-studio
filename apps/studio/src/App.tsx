import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import Navbar from './components/layout/Navbar'
import CustomCursor from './components/ui/CustomCursor'
import Home from './pages/Home'

function BackgroundEffects() {
  return (
    <>
      <div className="gradient-mesh">
        <div className="gradient-blob" />
        <div className="gradient-blob" />
        <div className="gradient-blob" />
      </div>
      <div className="grid-bg" />
      <div className="noise-overlay" />
    </>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <>
      <CustomCursor />
      <BackgroundEffects />
      <Navbar />
      <div className="page-wrap">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  )
}
