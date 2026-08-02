import { useSectionReveal } from '../hooks/useScrollSpy'

export default function RevealObserver({ children }: { children: React.ReactNode }) {
  useSectionReveal()
  return <>{children}</>
}
