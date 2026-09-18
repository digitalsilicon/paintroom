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
      class="lips-hotspot"
      type="button"
      id="lips"
      aria-label="Touch her lips"
      title="Lips"
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

// Mouth / open-smile center as % of the scene (matches Project machine: lips ~y 490–530).
function lipsScenePercent() {
  if (window.matchMedia('(max-width: 640px)').matches) {
    return { left: 57, top: 42 }
  }
  return { left: 50, top: 51 }
}

const scene = document.querySelector('.scene')
const smilePortrait = document.querySelector('.portrait--smile')
const speech = document.querySelector('#speech')
const sayHi = document.querySelector('#say-hi')
const again = document.querySelector('#again')
const lips = document.querySelector('#lips')
const audioCache = phrases.map((phrase) => {
  const audio = new Audio(phrase.src)
  audio.preload = 'auto'
  return audio
})
const moanAudio = new Audio('/phrases/moan.wav')
moanAudio.preload = 'auto'
moanAudio.volume = 1

let phraseIndex = 0
let hideTimer
let activeAudio = null
let audioUnlocked = false
let lastMoanAt = 0

function setMood(mood) {
  scene.classList.toggle('is-annoyed', mood === 'annoyed')
}

function stopActiveAudio() {
  if (!activeAudio) return
  activeAudio.pause()
  activeAudio.currentTime = 0
  activeAudio = null
}

function unlockAudio() {
  if (audioUnlocked) return
  audioUnlocked = true
  const silent = moanAudio.cloneNode()
  silent.volume = 0
  silent.play().then(() => {
    silent.pause()
  }).catch(() => {})
}

function positionLipsHotspot() {
  const sceneRect = scene.getBoundingClientRect()
  if (sceneRect.width < 2 || sceneRect.height < 2) return

  const { left, top } = lipsScenePercent()
  const size = Math.max(64, Math.min(sceneRect.width, sceneRect.height) * 0.12)
  lips.style.left = `${left}%`
  lips.style.top = `${top}%`
  lips.style.width = `${size * 1.55}px`
  lips.style.height = `${size * 1.05}px`
}

function playPhrase(index) {
  stopActiveAudio()

  const audio = audioCache[index]
  activeAudio = audio
  audio.currentTime = 0
  const play = audio.play()
  if (play && typeof play.catch === 'function') {
    play.catch(() => {
      // Browsers may block autoplay until a user gesture.
    })
  }

  return audio
}

function playMoan() {
  unlockAudio()
  // Prefer a clean moan over overlapping speech.
  stopActiveAudio()

  // Fresh node each time avoids stuck currentTime / interrupted play() states.
  const clip = moanAudio.cloneNode(true)
  clip.volume = 1
  activeAudio = clip

  const play = clip.play()
  if (play && typeof play.catch === 'function') {
    play.catch(() => {
      window.setTimeout(() => {
        clip.currentTime = 0
        clip.play().catch(() => {})
      }, 0)
    })
  }
}

function greet() {
  unlockAudio()
  const index = phraseIndex % phrases.length
  phraseIndex += 1
  const phrase = phrases[index]
  const audio = playPhrase(index)
  const durationSec =
    Number.isFinite(audio.duration) && audio.duration > 0
      ? audio.duration
      : phrase.durationSec
  const visibleMs = Math.max(2800, Math.round(durationSec * 1000) + 900)

  speech.textContent = phrase.text
  speech.style.setProperty('--bubble-ms', `${visibleMs}ms`)
  setMood(phrase.mood)
  speech.classList.remove('is-visible')
  // restart animation
  void speech.offsetWidth
  speech.classList.add('is-visible')

  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    speech.classList.remove('is-visible')
    setMood(null)
  }, visibleMs)
}

function onLipsActivate(event) {
  event.preventDefault()
  event.stopPropagation()
  const now = Date.now()
  // pointerdown + click can both fire; keep a single moan per gesture.
  if (now - lastMoanAt < 280) return
  lastMoanAt = now
  playMoan()
}

sayHi.addEventListener('click', greet)
again.addEventListener('click', greet)
lips.addEventListener('pointerdown', onLipsActivate)
lips.addEventListener('click', onLipsActivate)

window.addEventListener('resize', positionLipsHotspot)
if (smilePortrait.complete) {
  positionLipsHotspot()
} else {
  smilePortrait.addEventListener('load', positionLipsHotspot, { once: true })
}
window.setTimeout(positionLipsHotspot, 50)
window.setTimeout(positionLipsHotspot, 400)

// Soft auto-greet after the portrait settles in
window.setTimeout(greet, 900)
