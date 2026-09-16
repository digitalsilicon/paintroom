import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="scene" aria-label="Greeting">
    <div class="scene__media" aria-hidden="true">
      <img
        src="/smiling-girl-hi.png"
        alt=""
        width="1024"
        height="1365"
        fetchpriority="high"
      />
    </div>
    <div class="scene__wash" aria-hidden="true"></div>
    <div class="ambient" aria-hidden="true"></div>

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
  { text: 'Stop clicking on me!', src: '/phrases/stop.wav', durationSec: 2.14 },
]

const speech = document.querySelector('#speech')
const sayHi = document.querySelector('#say-hi')
const again = document.querySelector('#again')
const audioCache = phrases.map((phrase) => {
  const audio = new Audio(phrase.src)
  audio.preload = 'auto'
  return audio
})

let phraseIndex = 0
let hideTimer
let activeAudio = null

function playPhrase(index) {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.currentTime = 0
  }

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

function greet() {
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
  speech.classList.remove('is-visible')
  // restart animation
  void speech.offsetWidth
  speech.classList.add('is-visible')

  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    speech.classList.remove('is-visible')
  }, visibleMs)
}

sayHi.addEventListener('click', greet)
again.addEventListener('click', greet)

// Soft auto-greet after the portrait settles in
window.setTimeout(greet, 900)
