import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

// Types the headline out one character at a time, with a caret that follows.
//
// Every character is in the DOM from the first frame and only its opacity is
// flipped, so the line never reflows while it types and long headlines wrap in
// exactly the place they will end up. Characters are grouped into words, so a
// line can only break between words, never mid-word.

const CHAR_MS = 55 // per character
const SPACE_MS = 115 // a beat longer at a word gap
const START_DELAY = 260 // before the first character
const BLINK_AFTER = 1500 // caret fades this long after the last character

// The accent run is coloured character by character along these stops rather
// than with `background-clip: text`. A clipped gradient drops any descendant
// that is mid-fade — the characters would blink out instead of fading in.
// Taxi yellow into amber into coral — the brand's warm end, lit against the
// midnight hero.
const ACCENT_STOPS = [
  [255, 213, 74], // #FFD54A
  [255, 159, 10], // #FF9F0A
  [255, 107, 107], // #FF6B6B
]

function accentColor(t) {
  const span = 1 / (ACCENT_STOPS.length - 1)
  const i = Math.min(ACCENT_STOPS.length - 2, Math.floor(t / span))
  const local = (t - i * span) / span
  const [a, b] = [ACCENT_STOPS[i], ACCENT_STOPS[i + 1]]
  const mix = a.map((v, k) => Math.round(v + (b[k] - v) * local))
  return `rgb(${mix.join(', ')})`
}

export default function TypedHeadline({ segments, className = '' }) {
  // [{ chars: [{ ch, i, color }] }] — i is the character's position in the
  // whole headline, which is what the typing clock counts.
  const groups = useMemo(() => {
    const accentTotal = segments
      .filter((s) => s.accent)
      .reduce((n, s) => n + s.text.length, 0)

    let i = 0
    let a = 0
    return segments.flatMap((seg) =>
      (seg.text.match(/\S+\s*/g) || []).map((word) => ({
        chars: [...word].map((ch) => ({
          ch,
          i: i++,
          color: seg.accent ? accentColor(accentTotal > 1 ? a++ / (accentTotal - 1) : 0) : null,
        })),
      }))
    )
  }, [segments])

  const total = groups.reduce((n, g) => n + g.chars.length, 0)
  const fullText = segments.map((s) => s.text).join('')

  const prefersReduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [typed, setTyped] = useState(prefersReduced ? total : 0)
  const [caretGone, setCaretGone] = useState(prefersReduced)
  const [caret, setCaret] = useState(null)

  const hostRef = useRef(null)
  const charRefs = useRef([])

  // --- the typing itself ----------------------------------------------------
  // Driven off elapsed time rather than a chain of timers: a browser throttles
  // a hidden tab to one timer a second, which would leave someone who opened
  // the page in a background tab looking at half a headline. This way the
  // clock keeps running and the line catches up the moment it is looked at.
  useEffect(() => {
    if (prefersReduced) return

    // the moment each character should appear
    const schedule = []
    let t = START_DELAY
    for (const { ch } of groups.flatMap((g) => g.chars)) {
      schedule.push(t)
      t += ch === ' ' ? SPACE_MS : CHAR_MS
    }

    const start = performance.now()
    let raf
    let fade

    const tick = (now) => {
      const elapsed = now - start
      let n = 0
      while (n < schedule.length && elapsed >= schedule[n]) n += 1
      setTyped(n)
      if (n >= total) {
        fade = setTimeout(() => setCaretGone(true), BLINK_AFTER)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fade)
    }
  }, [groups, total, prefersReduced])

  // --- keep the caret on the last typed character ---------------------------
  useLayoutEffect(() => {
    if (prefersReduced) return

    const place = () => {
      const host = hostRef.current
      const el = charRefs.current[Math.max(0, typed - 1)]
      if (!host || !el) return
      const h = host.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      setCaret({
        x: (typed === 0 ? r.left : r.right) - h.left,
        y: r.top - h.top,
        h: r.height,
      })
    }

    place()
    window.addEventListener('resize', place)
    // The web font lands after first paint and moves every glyph.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place)
    return () => window.removeEventListener('resize', place)
  }, [typed, prefersReduced])

  const done = typed >= total

  return (
    <h1 className={`typedline ${className}`.trim()} ref={hostRef}>
      {/* what a screen reader gets: the finished sentence, once */}
      <span className="visually-hidden">{fullText}</span>

      <span aria-hidden="true">
        {groups.map((g, gi) => (
          <span key={gi} className="typedline__word">
            {g.chars.map(({ ch, i, color }) => (
              <span
                key={i}
                ref={(el) => {
                  charRefs.current[i] = el
                }}
                className={`typedline__char${i < typed ? ' is-on' : ''}`}
                style={color ? { color } : undefined}
              >
                {ch}
              </span>
            ))}
          </span>
        ))}
      </span>

      {caret && !caretGone && (
        <span
          className={`typedline__caret${done ? ' is-blinking' : ''}`}
          aria-hidden="true"
          style={{
            transform: `translate3d(${caret.x}px, ${caret.y}px, 0)`,
            height: `${caret.h * 0.78}px`,
          }}
        />
      )}
    </h1>
  )
}
