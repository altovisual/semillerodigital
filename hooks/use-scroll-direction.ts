import { useState, useEffect } from 'react'

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let lastScrollY = window.pageYOffset
    let ticking = false

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset

      if (Math.abs(scrollY - lastScrollY) < 10) {
        // Ignore small scroll movements
        ticking = false
        return
      }

      const direction = scrollY > lastScrollY ? 'down' : 'up'
      
      if (direction !== scrollDirection) {
        setScrollDirection(direction)
        setIsVisible(direction === 'up' || scrollY < 100) // Show when scrolling up or near top
      }

      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [scrollDirection])

  return { scrollDirection, isVisible }
}
