/*
*********************************
CONSTANTS
*********************************
*/

const colourPalette = {
  light: '#FFA500',
  medium: '#FF8C00',
  dark: '#FF4500',
  complement: '#ffc800',
  accent: '#FAF0E6'
}

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const startBtn = document.querySelector('.play')

let WIDTH = canvas.width
let HEIGHT = canvas.height

let audioctx, source, audio, analyser, freqs, radius, dashIntervals

let isRunning = false

/*
*********************************
HELPER FUNCTIONS
*********************************
*/

function drawRing (ctx, radius, weight, stroke) {
  console.log(stroke)
  ctx.beginPath()
  ctx.strokeStyle = stroke
  ctx.lineWidth = weight
  ctx.arc(WIDTH / 2, HEIGHT / 2, radius, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.closePath()
}

function center (el, halfsize) {
  el.style.top = `${(HEIGHT / 2) - (halfsize)}px`
  el.style.left = `${(WIDTH / 2) - (halfsize)}px`
}

/*
*********************************
ON LOAD
*********************************
*/

resizeCanvas()
startBtn.addEventListener('click', init)
window.addEventListener('resize', resizeCanvas)

/*
*********************************
MAIN FUNCTIONS
*********************************
*/

function init () {
  isRunning = true
  startBtn.remove()
  audioctx = new (
    window.AudioContext || window.webkitAudioContext
  )() // new audio context
  audio = new Audio()
  audio.src = 'media/sample.mp3'

  source = audioctx.createMediaElementSource(audio)
  analyser = audioctx.createAnalyser()
  source.connect(analyser)
  analyser.connect(audioctx.destination)

  freqs = new Uint8Array(analyser.frequencyBinCount)

  dashIntervals = [5, 5, 10, 15, 25, 20, 35, 10, 50]
  audio.play()
  draw()
}

function draw () {
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const bars = 200
  radius = WIDTH > 500 ? 150 : 100
  drawInnerRings(ctx, radius)
  console.log(radius)

  ctx.lineWidth = 4

  ctx.setLineDash(dashIntervals)
  analyser.getByteFrequencyData(freqs)

  for (let i = 0; i < bars; i++) {
    const radians = (Math.PI * 2) / bars
    let barHeight = freqs[i] * 1
    if (barHeight > canvas.width / 3) barHeight = freqs[i] * 0.3

    const color = `rgb(${255}, ${255 - freqs[i]}, ${0})`
    const color2 = `rgb(${255}, ${200 - freqs[i]}, ${0})`

    const x = (WIDTH / 2) + Math.cos(radians * i) * radius
    const xEnd = (WIDTH / 2) + Math.cos(radians * i) * (radius + barHeight)
    const y = (HEIGHT / 2) + Math.sin(radians * i) * radius
    const yEnd = (HEIGHT / 2) + Math.sin(radians * i) * (radius + barHeight)

    ctx.strokeStyle = color
    ctx.fillStyle = color2

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(xEnd, yEnd)
    ctx.stroke()
  }

  requestAnimationFrame(draw)
}

function resizeCanvas () {
  canvas.width = window.innerWidth
  WIDTH = canvas.width
  canvas.height = window.innerHeight
  HEIGHT = canvas.height
  ctx.fillStyle = colourPalette.light
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
  if (!isRunning) {
    center(startBtn, 75)
  }
}

function drawInnerRings (ctx, radius) {
  ctx.setLineDash([])
  drawRing(ctx, radius - 20, 4, colourPalette.complement)
  drawRing(ctx, radius - 30, 2, colourPalette.light)
  drawRing(ctx, radius - 40, 4, colourPalette.medium)
  drawRing(ctx, radius - 55, 4, colourPalette.medium)
  drawRing(ctx, radius - 70, 7, colourPalette.complement)
  drawRing(ctx, radius - 85, 1, colourPalette.dark)
  drawRing(ctx, radius - 90, 1, colourPalette.medium)
}

