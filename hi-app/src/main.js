import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="scene" aria-label="Greeting">
    <div class="scene__media" aria-hidden="true">
      <img
        class="portrait portrait--smile"
        src="/smiling-girl-hi.png"
        alt=""
        width="1024"
        height="1536"
        fetchpriority="high"
      />
      <img
        class="portrait portrait--frown"
        src="/frowning-girl-hi.png"
        alt=""
        width="864"
        height="1152"
        loading="eager"
      />
    </div>
    <div class="scene__wash" aria-hidden="true"></div>
    <div class="ambient" aria-hidden="true"></div>

    <button
      class="nose-hotspot"
      type="button"
      id="nose"
      aria-label="Boop her nose"
      title="Nose"
    ></button>

    <p class="bubble" id="speech" role="status" aria-live="polite">Hi!</p>

    <section class="scene__content">
      <p class="brand">Hi.</p>
      <h1 class="headline">She’s glad you’re here.</h1>
      <p class="support">
        A simple little hello you can hear — smile optional, but hers is already on.
      </p>
      <div class="actions">
        <button class="btn btn--primary" type="button" id="say-hi">
          Say hi back
        </button>
        <button class="btn btn--ghost" type="button" id="again">
          Wave again
        </button>
      </div>
    </section>
  </main>
`

const phrases = [
  { text: 'Hi!', src: '/phrases/hi.wav', durationSec: 1.87 },
  { text: 'Hello!', src: '/phrases/hello.wav', durationSec: 1.87 },
  { text: 'How are you doing?', src: '/phrases/how-are-you.wav', durationSec: 1.9 },
  { text: 'Lovely to see you again.', src: '/phrases/lovely.wav', durationSec: 2.3 },
  { text: 'Stop clicking on me!', src: '/phrases/stop.wav', durationSec: 2.14, mood: 'annoyed' },
]

function noseImagePoint() {
  if (window.matchMedia('(max-width: 640px)').matches) {
    return { x: 0.52, y: 0.348 }
  }
  return { x: 0.5, y: 0.335 }
}

const PORTRAIT_SCALE = 1.04
const BOOP_COOLDOWN_MS = 700

const scene = document.querySelector('.scene')
const smilePortrait = document.querySelector('.portrait--smile')
const speech = document.querySelector('#speech')
const sayHi = document.querySelector('#say-hi')
const again = document.querySelector('#again')
const nose = document.querySelector('#nose')

// Prefetch each phrase so the first click is not racing the network.
const audioCache = phrases.map((phrase) => {
  const audio = new Audio(phrase.src)
  audio.preload = 'auto'
  audio.addEventListener(
    'error',
    () => {
      phrase.missing = true
    },
    { once: true },
  )
  audio.addEventListener(
    'loadedmetadata',
    () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        phrase.durationSec = audio.duration
      }
    },
    { once: true },
  )
  return audio
})
const boopAudio = new Audio('/phrases/boop.wav')
boopAudio.preload = 'auto'
boopAudio.volume = 1

let phraseIndex = 0
let hideTimer
let activeAudio = null
let audioUnlocked = false
let lastBoopAt = 0
let noseArmed = true

function setMood(mood) {
  scene.classList.toggle('is-annoyed', mood === 'annoyed')
}

function stopActiveAudio() {
  if (!activeAudio) return
  try {
    activeAudio.pause()
  } catch {
    // ignore
  }
  try {
    activeAudio.currentTime = 0
  } catch {
    // ignore seek errors on unloaded / failed elements
  }
  activeAudio = null
}

/**
 * Must run inside a user-gesture stack (pointerdown/click).
 * Do not mark unlocked unless play actually succeeds.
 */
function unlockAudio() {
  if (audioUnlocked) return Promise.resolve(true)
  const silent = boopAudio.cloneNode(true)
  silent.muted = true
  silent.volume = 0
  const play = silent.play()
  if (!play || typeof play.then !== 'function') {
    audioUnlocked = true
    return Promise.resolve(true)
  }
  return play
    .then(() => {
      silent.pause()
      audioUnlocked = true
      return true
    })
    .catch(() => false)
}

function playClip(src, { volume = 1 } = {}) {
  stopActiveAudio()
  // Fresh node each time — reused HTMLAudioElement + failed autoplay
  // can leave elements in a state where later play() never audibly starts.
  const clip = new Audio(src)
  clip.preload = 'auto'
  clip.volume = volume
  activeAudio = clip

  const attempt = () => {
    try {
      clip.currentTime = 0
    } catch {
      // ignore
    }
    return clip.play()
  }

  const play = attempt()
  if (play && typeof play.catch === 'function') {
    play.catch(() => {
      // One microtask retry helps after a prior NotAllowedError unlock.
      window.setTimeout(() => {
        if (activeAudio !== clip) return
        attempt().catch(() => {})
      }, 0)
    })
  }
  return clip
}

function playPhrase(index) {
  const phrase = phrases[index]
  if (!phrase || phrase.missing) {
    stopActiveAudio()
    return null
  }
  return playClip(phrase.src)
}

function playBoop() {
  unlockAudio()
  // Brief interrupt only — does not advance the greeting playlist.
  stopActiveAudio()
  // If we cut off “Stop clicking…”, drop the frown so it cannot stick.
  setMood(null)

  playClip('/phrases/boop.wav')

  const visibleMs = 1200
  speech.textContent = 'Boop!'
  speech.style.setProperty('--bubble-ms', `${visibleMs}ms`)
  speech.classList.remove('is-visible')
  void speech.offsetWidth
  speech.classList.add('is-visible')

  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    speech.classList.remove('is-visible')
  }, visibleMs)
}

function showBubble(phrase, visibleMs) {
  speech.textContent = phrase.text
  speech.style.setProperty('--bubble-ms', `${visibleMs}ms`)
  setMood(phrase.mood)
  speech.classList.remove('is-visible')
  void speech.offsetWidth
  speech.classList.add('is-visible')

  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    speech.classList.remove('is-visible')
    setMood(null)
  }, visibleMs)
}

function greet() {
  // Caller should be a user gesture (button click). Unlock first while
  // still in that gesture stack.
  unlockAudio()
  const index = phraseIndex % phrases.length
  phraseIndex += 1
  const phrase = phrases[index]
  const audio = playPhrase(index)
  const durationSec =
    audio && Number.isFinite(audio.duration) && audio.duration > 0
      ? audio.duration
      : phrase.durationSec
  const visibleMs = Math.max(2800, Math.round(durationSec * 1000) + 900)
  showBubble(phrase, visibleMs)
}

/** Visual-only intro — never call play() without a user gesture. */
function softIntro() {
  const phrase = phrases[0]
  const visibleMs = Math.max(2800, Math.round(phrase.durationSec * 1000) + 900)
  showBubble(phrase, visibleMs)
  // Leave phraseIndex at 0 so the first click speaks “Hi!” with audio.
}

function onNosePointerEnter(event) {
  event.stopPropagation()
  if (!noseArmed) return
  const now = Date.now()
  if (now - lastBoopAt < BOOP_COOLDOWN_MS) return
  noseArmed = false
  lastBoopAt = now
  playBoop()
}

function onNosePointerLeave() {
  // Re-arm only after the cursor leaves the tip so jitter does not spam.
  noseArmed = true
}

function positionNoseHotspot() {
  const nw = smilePortrait.naturalWidth || 1024
  const nh = smilePortrait.naturalHeight || 1536
  const rect = smilePortrait.getBoundingClientRect()
  const sceneRect = scene.getBoundingClientRect()
  if (rect.width < 2 || rect.height < 2) return

  const layoutW = rect.width / PORTRAIT_SCALE
  const layoutH = rect.height / PORTRAIT_SCALE
  const layoutLeft = rect.left + (rect.width - layoutW) / 2
  const layoutTop = rect.top + (rect.height - layoutH) / 2

  const objectPositionY = window.matchMedia('(max-width: 640px)').matches
    ? 0.12
    : window.matchMedia('(min-width: 900px)').matches
      ? 0.22
      : 0.18
  const objectPositionX = window.matchMedia('(max-width: 640px)').matches
    ? 0.58
    : 0.5

  const cover = Math.max(layoutW / nw, layoutH / nh)
  const dispW = nw * cover
  const dispH = nh * cover
  const offsetX = (layoutW - dispW) * objectPositionX
  const offsetY = (layoutH - dispH) * objectPositionY

  const point = noseImagePoint()
  let x = layoutLeft - sceneRect.left + offsetX + point.x * dispW
  let y = layoutTop - sceneRect.top + offsetY + point.y * dispH

  const cx = rect.left - sceneRect.left + rect.width / 2
  const cy = rect.top - sceneRect.top + rect.height / 2
  x = cx + (x - cx) * PORTRAIT_SCALE
  y = cy + (y - cy) * PORTRAIT_SCALE

  const noseSize = Math.max(28, Math.min(layoutW, layoutH) * 0.045)
  nose.style.left = `${x}px`
  nose.style.top = `${y}px`
  nose.style.width = `${noseSize}px`
  nose.style.height = `${noseSize}px`
}

// Unlock during pointerdown so the gesture still covers the later play().
sayHi.addEventListener('pointerdown', () => {
  unlockAudio()
})
again.addEventListener('pointerdown', () => {
  unlockAudio()
})
sayHi.addEventListener('click', greet)
again.addEventListener('click', greet)
nose.addEventListener('pointerenter', onNosePointerEnter)
nose.addEventListener('pointerleave', onNosePointerLeave)

window.addEventListener('resize', positionNoseHotspot)
if (smilePortrait.complete) {
  positionNoseHotspot()
} else {
  smilePortrait.addEventListener('load', positionNoseHotspot, { once: true })
}
window.setTimeout(positionNoseHotspot, 50)
window.setTimeout(positionNoseHotspot, 400)
window.setTimeout(positionNoseHotspot, 1000)

// Soft visual intro only — audio starts on the first button gesture.
window.setTimeout(softIntro, 900)

// Best-effort HEAD check so missing files skip play without breaking the UI.
phrases.forEach((phrase) => {
  fetch(phrase.src, { method: 'HEAD', cache: 'force-cache' })
    .then((res) => {
      if (!res.ok) phrase.missing = true
    })
    .catch(() => {
      phrase.missing = true
    })
})
