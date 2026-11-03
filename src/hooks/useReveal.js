import { useEffect } from 'react'

// Fades and un-blurs every [data-reveal] element the first time it scrolls
// into view. Elements start hidden via CSS (.reveal) and get .is-visible here.
export function useReveal(page) {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]')

    // No IntersectionObserver (very old browser) - just show everything.
    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    nodes.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [page])
}
