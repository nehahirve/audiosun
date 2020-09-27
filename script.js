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

let audioctx, source, analyser, freqs, radius,
  radians, bars, factor, angle, meanFreq

let isRunning = false
let dashIntervals = []
/*
*********************************
HELPER FUNCTIONS
*********************************
*/

function drawRing (ctx, radius, weight, stroke) {
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

function handleDragOver (e) {
  e.preventDefault()
  e.stopPropagation()
}

function togglePause () {
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
window.addEventListener('dragover', handleDragOver, false)
window.addEventListener('resize', resizeCanvas)

/*
*********************************
MAIN FUNCTIONS
*********************************
*/

function init (e)  {
  isRunning = false
  

  startBtn.style.opacity = 0
  factor = 1
  
  e.preventDefault()
  e.stopPropagation()

  if (audioctx) {
    audioctx.suspend()
    audioctx.close()
  }

  audioctx = new (
    window.AudioContext || window.webkitAudioContext
  )()
  

  window.addEventListener('click', togglePause)
  
  const file = e.dataTransfer.files[0]
  const reader = new FileReader()
  
  reader.addEventListener('load', e => {
    const data = e.target.result
    console.log(data)
    audioctx.decodeAudioData(data, buffer => {
      source = audioctx.createBufferSource()
      source.buffer = buffer
      analyser = audioctx.createAnalyser()
      analyser.connect(audioctx.destination)
      source.connect(analyser)
      source.start(0)
      freqs = new Uint8Array(analyser.frequencyBinCount)
      dashIntervals = [5, 5, 10, 15, 25, 20, 35, 10, 50]
      angle = 0
      factor = 1
      threshold = 10
      lastMean = 0
      radians = (Math.PI * 2) / bars
      isRunning = true
      draw()
    })
  })
  reader.readAsArrayBuffer(file)
}

function draw () {
  factor -= 0.05
  angle += 0.001
  radius = WIDTH > 500 ? 150 : 100

  ctx.fillRect(0, 0, canvas.width, canvas.height)
  drawInnerRings(ctx, radius)

  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.strokeStyle = colourPalette.complement
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

  ctx.lineWidth = 4

  ctx.setLineDash(dashIntervals)
  analyser.getByteFrequencyData(freqs)

  const meanArray = []
  const barFactor = WIDTH > 500 ? 1 : 0.4
  


  for (let i = 0; i < bars; i++) {
    meanArray.push(freqs[i])
    let barHeight = freqs[i] * barFactor

    const barColour = `rgb(${255}, ${255 - freqs[i]}, ${0})`

    const x = (WIDTH / 2) +
      Math.cos(radians * (i + factor)) * radius
    const xEnd = (WIDTH / 2) +
      Math.cos(radians * (i + factor)) * (radius + barHeight)
    const y = (HEIGHT / 2) +
      Math.sin(radians * (i + factor)) * radius
    const yEnd = (HEIGHT / 2) +
      Math.sin(radians * (i + factor)) * (radius + barHeight)

    ctx.strokeStyle = barColour

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(xEnd, yEnd)
    ctx.stroke()
  }

  meanFreq = average(meanArray)
  if(meanFreq) {
    ctx.fillStyle = `rgb(${255}, ${190 - meanFreq / 2}, ${0})`
  } else {
    ctx.fillStyle = colourPalette.complement
  }
  if (isRunning) requestAnimationFrame(draw)
}

function resizeCanvas () {
  canvas.width = window.innerWidth
  WIDTH = canvas.width
  canvas.height = window.innerHeight
  HEIGHT = canvas.height
  ctx.fillStyle = colourPalette.complement
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
  if (!isRunning) {
    center(startBtn, 100)
  }
  bars = WIDTH > 500 ? 200 : 100
  
}

function average (array) {
  const sum = array.reduce((sum, value) => {
    return sum + value
  })

  return sum / array.length
}

function drawInnerRings (ctx, radius) {
  ctx.setLineDash([])
  drawRing(ctx, radius - 20, 4, colourPalette.complement)
  drawRing(ctx, radius - 30, 2, colourPalette.light)
  drawRing(ctx, radius - 40, 4, colourPalette.medium)
  drawRing(ctx, radius - 55, 4, colourPalette.medium)
  drawRing(ctx, radius - 85, 1, colourPalette.dark)
  drawRing(ctx, radius - 90, 1, colourPalette.accent)
  if (radius > 100) {
    drawRing(ctx, radius - 110, 10, colourPalette.light)
    drawRing(ctx, radius - 130, 3, colourPalette.medium)
  } else {
    drawRing(ctx, radius - 100, 10, colourPalette.light)
  }
}
