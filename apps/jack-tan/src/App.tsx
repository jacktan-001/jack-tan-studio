import Sidebar from './components/Sidebar'
import RevealObserver from './components/RevealObserver'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Works from './components/Works'
import Patents from './components/Patents'
import Skills from './components/Skills'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-[380px_1fr]">
      <Sidebar />
      <RevealObserver>
        <main className="px-4 py-12 sm:px-7 lg:px-14 lg:py-12">
          <About />
          <Experience />
          <Projects />
          <Works />
          <Patents />
          <Skills />
          <Footer />
        </main>
      </RevealObserver>
    </div>
  )
}
