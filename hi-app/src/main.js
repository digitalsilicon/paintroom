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

const speech = document.querySelector('#speech')
const sayHi = document.querySelector('#say-hi')
const again = document.querySelector('#again')
const hiAudio = new Audio('/hi.wav')
hiAudio.preload = 'auto'
let hideTimer

function playHi() {
  hiAudio.pause()
  hiAudio.currentTime = 0
  const play = hiAudio.play()
  if (play && typeof play.catch === 'function') {
    play.catch(() => {
      // Browsers may block autoplay until a user gesture.
    })
  }
}

function greet() {
  speech.classList.remove('is-visible')
  // restart animation
  void speech.offsetWidth
  speech.classList.add('is-visible')
  playHi()
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    speech.classList.remove('is-visible')
  }, 2800)
}

sayHi.addEventListener('click', greet)
again.addEventListener('click', greet)

// Soft auto-greet after the portrait settles in
window.setTimeout(greet, 900)
