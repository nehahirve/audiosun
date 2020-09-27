/*
*********************************
VARIABLES
*********************************
*/
const breakpoint = 750

const colorway = {
  warm: {
    light: '#FFA500',
    medium: '#FF8C00',
    dark: '#FF4500',
    complement: '#ffc800',
    accent: '#FFFFE0'
  },
  cool: {
    light: '#00DFFF',
    medium: '#008CFF',
    dark: '#0000CD',
    complement: '#ffc800',
    accent: '#FFFFE0'
  }
}

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const startBtn = document.querySelector('.play')

let mode = 'warm'
let WIDTH = canvas.width
let HEIGHT = canvas.height

let audioctx, source, analyser, freqs, radius,
  radians, bars, circlePathFactor, angle, meanFreq, dashIntervals,
  barFactor, rValue, bValue, gValue, isMobile, hasStarted

let isRunning = false

/*
*********************************
HELPER FUNCTIONS
*********************************
*/

function ring (ctx, radius, weight, stroke) {
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

function average (array) {
  const sum = array.reduce((sum, value) => {
    return sum + value
  })
  return sum / array.length
}

function drawStaticRings (ctx, radius) {
  ctx.setLineDash([])
  ring(ctx, radius - 20, 4, colorway[mode].complement)
  ring(ctx, radius - 30, 2, colorway[mode].light)
  ring(ctx, radius - 40, 4, colorway[mode].medium)
  ring(ctx, radius - 55, 4, colorway[mode].medium)
  ring(ctx, radius - 85, 1, colorway[mode].dark)
  ring(ctx, radius - 90, 1.5, colorway[mode].accent)
  if (!isMobile) {
    ring(ctx, radius - 110, 10, colorway[mode].light)
    ring(ctx, radius - 130, 3, colorway[mode].medium)
  } else {
    ring(ctx, radius - 100, 10, colorway[mode].light)
  }
}

function setFillStyle () {
  if (meanFreq) {
    ctx.fillStyle = `rgb(${rValue}, ${gValue - meanFreq / 2}, ${bValue})`
  } else {
    ctx.fillStyle = colorway[mode].complement
  }
}

/*
*********************************
EVENT HANDLERS
*********************************
*/

function keyHandler (e) { // controls colouring
  if (e.keyCode === 32) { // spacebar
    mode = mode === 'warm' ? 'cool' : 'warm'
  }
  if (e.keyCode === 38) { // up arrow
    gValue = gValue > 245 ? 255 : gValue += 10
  }
  if (e.keyCode === 40) { // down arrow
    gValue = gValue < 10 ? 0 : gValue -= 10
  }
}

function dragHandler (e) { // when files dragged across
  e.preventDefault()
  e.stopPropagation()
}

function clickHandler () { // toggles pause and play
  if (audioctx.state === 'running') {
    isRunning = false
    audioctx.suspend()
  } else if (audioctx.state === 'suspended') {
    isRunning = true
    requestAnimationFrame(draw)
    audioctx.resume()
  }
}

/*
*********************************
ON LOAD
*********************************
*/

resizeCanvas()

window.addEventListener('drop', init)
window.addEventListener('dragover', dragHandler, false)
window.addEventListener('resize', resizeCanvas)

/*
*********************************
MAIN FUNCTIONS
*********************************
*/

function init (e) {
  hasStarted = true
  e.preventDefault()
  e.stopPropagation()

  // RESETS ADUIO CONTEXT AND ANIMATIONS
  isRunning = false

  if (audioctx) {
    audioctx.suspend()
    audioctx.close()
  }

  // LOAD CANVAS AND AUDIOCONTEXT
  startBtn.style.opacity = 0
  canvas.style.opacity = 1

  audioctx = new (
    window.AudioContext || window.webkitAudioContext
  )()

  window.addEventListener('click', clickHandler)
  window.addEventListener('keydown', keyHandler)

  // DECODE AUDIO BUFFER
  const file = e.dataTransfer.files[0]
  const reader = new FileReader()

  reader.addEventListener('load', e => {
    const data = e.target.result
    audioctx.decodeAudioData(data, buffer => {
      source = audioctx.createBufferSource()
      source.buffer = buffer
      analyser = audioctx.createAnalyser()
      analyser.connect(audioctx.destination)
      source.connect(analyser)
      source.start(0)
      // INITIAL ANIMATION VALUES SET
      freqs = new Uint8Array(analyser.frequencyBinCount)
      dashIntervals = [5, 5, 10, 15, 25, 20, 35, 10, 50]
      angle = 0
      circlePathFactor = 1
      gValue = 200
      isRunning = true
      draw()
    })
  })
  reader.readAsArrayBuffer(file)
}

function draw () {
  circlePathFactor -= 0.05
  angle += 0.001

  ctx.fillRect(0, 0, canvas.width, canvas.height)
  drawStaticRings(ctx, radius)

  // CENTER MOVING RING
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.strokeStyle = colorway[mode].complement
  ctx.lineWidth = 7
  ctx.arc(
    WIDTH / 2,
    HEIGHT / 2,
    radius - 70,
    angle,
    2 * Math.PI + angle
  )
  ctx.stroke()
  ctx.closePath()
  ctx.setLineDash([])

  // BARS
  ctx.lineWidth = 4

  ctx.setLineDash(dashIntervals)
  analyser.getByteFrequencyData(freqs)

  const meanArray = []

  rValue = mode === 'warm' ? 255 : 0
  bValue = mode === 'warm' ? 0 : 255

  for (let i = 0; i < bars; i++) {
    meanArray.push(freqs[i])
    const barHeight = freqs[i] * barFactor

    const barColour = `rgb(${rValue}, ${255 - freqs[i]}, ${bValue})`

    const x = (WIDTH / 2) +
      Math.cos(radians * (i + circlePathFactor)) * radius
    const xEnd = (WIDTH / 2) +
      Math.cos(radians * (i + circlePathFactor)) * (radius + barHeight)
    const y = (HEIGHT / 2) +
      Math.sin(radians * (i + circlePathFactor)) * radius
    const yEnd = (HEIGHT / 2) +
      Math.sin(radians * (i + circlePathFactor)) * (radius + barHeight)

    ctx.strokeStyle = barColour

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(xEnd, yEnd)
    ctx.stroke()
  }

  // SET BACKGROUND COLOUR
  meanFreq = average(meanArray)
  setFillStyle()

  // CONTINUE LOOP
  if (isRunning) requestAnimationFrame(draw)
}

function resizeCanvas () {
  canvas.width = window.innerWidth
  WIDTH = canvas.width
  canvas.height = window.innerHeight
  HEIGHT = canvas.height
  setFillStyle()
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

  if (!isRunning) {
    center(startBtn, 100)
  }

  isMobile = WIDTH < breakpoint

  bars = isMobile ? 100 : 200
  radians = (Math.PI * 2) / bars
  radius = isMobile ? 100 : 150
  barFactor = isMobile ? 0.4 : 1
  if (hasStarted && !isRunning) draw()
}
