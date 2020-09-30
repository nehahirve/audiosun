/*
*********************************
VARIABLES
*********************************
*/

const breakpoint = 750 // mobile breakpoint

const canvas = document.querySelector('canvas') // grab important DOM elements
const ctx = canvas.getContext('2d')
const splashimage = document.querySelector('.wrapper')
const main = document.querySelector('main')

const colorway = {
  warm: {
    light: '#FFA500',
    medium: '#FF8C00',
    dark: '#FF4500',
    complement: '#ffc800',
    background: '#ffc800',
    solidRing: '#FFA500',
    accent: '#FFFFC0'
  },
  cool: {
    light: '#00DFFF',
    medium: '#008CFF',
    dark: '#0000CD',
    complement: '#ffc800',
    background: '#00AFFF',
    solidRing: '#ffc800',
    accent: '#FFFFC0'
  }
}

let mode = 'warm' // some defaults on loading
let WIDTH = canvas.width
let HEIGHT = canvas.height

let audioctx, source, song, analyser, freqs, meanFreq // audio context globals

let isRunning = false // binaries
let isMobile, canvasStarted

let sunAngle, radius, radians, rays, // animation math variables
  rayPositionIncrement, angle,
  dashIntervals, rayHeightFactor, rValue, bValue, gValue

/*
*********************************
HELPER FUNCTIONS
*********************************
*/

function setMainColours () { // COLOURS SPLASH PAGE ACCORDING TO MODE
  main.style.backgroundColor = colorway[mode].background
  const rings = Array.from(main.children[0].children)
  rings[0].style.borderColor = colorway[mode].medium

  rings.slice(1, 3).forEach(ring => {
    ring.style.borderTopColor = colorway[mode].solidRing
    ring.style.borderLeftColor = colorway[mode].solidRing
  })

  rings[3].style.borderTopColor = colorway[mode].dark
  rings[3].style.borderLeftColor = colorway[mode].dark
  rings[4].style.borderTopColor = colorway[mode].dark
  rings[5].style.borderTopColor = colorway[mode].medium
  rings[6].style.borderTopColor = colorway[mode].background
  rings[7].children[1].children[0].style.fill = colorway[mode].dark
  rings[8].children[1].children[0].style.fill = colorway[mode].medium
  rings[9].children[1].children[0].style.fill = colorway[mode].dark
  rings[10].children[1].children[0].style.fill = colorway[mode].accent
}

function animateCenterRing () { // animates the splash page ring
  if (!sunAngle) sunAngle = 0
  console.log('animating')

  main.children[0].children[10].style.transform = `scale(0.54) rotate(${sunAngle - 264}deg)`
  main.children[0].children[6].style.transform = `rotate(${sunAngle + 110}deg)`
  main.children[0].children[5].style.transform = `rotate(${sunAngle + 55}deg)`
  sunAngle -= 0.1

  if (!canvasStarted) requestAnimationFrame(animateCenterRing) 
  else sunAngle = 0
}

function drawStaticRings (ctx, radius) { // draws all the static rings on canvas
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

function ring (ctx, radius, weight, stroke) { // draws a ring to canvas
  ctx.beginPath()
  ctx.strokeStyle = stroke
  ctx.lineWidth = weight
  ctx.arc(WIDTH / 2, HEIGHT / 2, radius, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.closePath()
}

function paintBackground () { // calculcates canvas background colour
  if (meanFreq) {
    ctx.fillStyle = `rgb(${rValue}, ${gValue - meanFreq / 1.4}, ${bValue})`
  } else {
    ctx.fillStyle = colorway[mode].background
  }
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
}

function setAnimationValues () { // SETS INITIAL ANIMATION VALUES
  freqs = new Uint8Array(analyser.frequencyBinCount)
  dashIntervals = [5, 5, 10, 15, 25, 20, 35, 10, 50]
  angle = 0
  rayPositionIncrement = 1
  gValue = 200
  isRunning = true
}

function center (el, halfsize) { // centers an element
  el.style.top = `${(HEIGHT / 2) - (halfsize)}px`
  el.style.left = `${(WIDTH / 2) - (halfsize)}px`
}

function average (array) { // finds mean of array
  const sum = array.reduce((sum, value) => {
    return sum + value
  })
  return sum / array.length
}

/*
*********************************
EVENT HANDLERS
*********************************
*/

function keyHandler (e) { // controls colouring
  if (e.keyCode === 32) { // spacebar
    mode = mode === 'warm' ? 'cool' : 'warm'
    setMainColours()
  }
  if (e.keyCode === 38) { // up arrow
    gValue = gValue > 254 ? 255 : gValue += 10
  }
  if (e.keyCode === 40) { // down arrow
    gValue = gValue < 1 ? 0 : gValue -= 10
  }
  if (e.keyCode === 27 && canvasStarted) { // escape
    destroy(0)
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

setMainColours(main)
resizeCanvas()
animateCenterRing()
window.addEventListener('drop', init)
window.addEventListener('click', init)
window.addEventListener('touchstart', init)
window.addEventListener('dragover', dragHandler, false)
window.addEventListener('resize', resizeCanvas)
window.addEventListener('keydown', keyHandler)

/*
*********************************
MAIN FUNCTIONS
*********************************
*/

function init (e) {
  window.removeEventListener('click', init)
  e.preventDefault()
  canvasStarted = true

  // RESETS ADUIO CONTEXT AND ANIMATIONS
  isRunning = false

  if (audioctx && audioctx.state !== 'closed') {
    audioctx.close()
  }

  // LOAD CANVAS AND AUDIOCONTEXT
  main.style.opacity = 0
  canvas.style.opacity = 1

  audioctx = new (
    window.AudioContext || window.webkitAudioContext
  )()

  window.addEventListener('click', clickHandler)
  window.addEventListener('touchstart', clickHandler)

  // DECIDES TYPE OF AUDIO NODE TO CREATE
  if (e.type === 'click' || e.type === 'touchstart') {
    loadAudioFile(e)
  } else {
    loadAudioBuffer(e)
  }
}

function loadAudioFile (e) { // PLAY PRE-LOADED SAMPLE
  song = new Audio()
  song.src = 'media/sample.mp3'
  source = audioctx.createMediaElementSource(song)
  analyser = audioctx.createAnalyser()
  analyser.connect(audioctx.destination)
  source.connect(analyser)
  song.play()
  setAnimationValues()
  draw()
}

function loadAudioBuffer (e) { // DECODE AUDIO BUFFER
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
      if (audioctx.state === 'suspended') audioctx.resume() // bugfix for safari
      setAnimationValues()
      draw()
    })
  })
  reader.readAsArrayBuffer(file)
}

function draw () {
  if (audioctx.state === 'closed') return // prevents paint after destroy
  if (source) {
    source.addEventListener('ended', destroy.bind(source, 1500))
    song.addEventListener('ended', destroy.bind(song, 1500))
  }

  paintBackground()
  drawStaticRings(ctx, radius)

  // CENTER MOVING RING
  angle += 0.001

  ctx.beginPath()
  ctx.setLineDash([5, 5])
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

  // RAYS
  ctx.lineWidth = 4
  rayPositionIncrement -= 0.05
  ctx.setLineDash(dashIntervals)

  analyser.getByteFrequencyData(freqs)

  const meanArray = []

  rValue = mode === 'warm' ? 255 : 0
  bValue = mode === 'warm' ? 0 : 255

  for (let i = 0; i < rays; i++) {
    meanArray.push(freqs[i])
    const rayHeight = freqs[i] * rayHeightFactor

    const barColour = `rgb(${rValue}, ${255 - freqs[i]}, ${bValue})`

    const x = (WIDTH / 2) +
      Math.cos(radians * (i + rayPositionIncrement)) * radius
    const xEnd = (WIDTH / 2) +
      Math.cos(radians * (i + rayPositionIncrement)) * (radius + rayHeight)
    const y = (HEIGHT / 2) +
      Math.sin(radians * (i + rayPositionIncrement)) * radius
    const yEnd = (HEIGHT / 2) +
      Math.sin(radians * (i + rayPositionIncrement)) * (radius + rayHeight)

    ctx.strokeStyle = barColour

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(xEnd, yEnd)
    ctx.stroke()
    ctx.closePath()
  }

  // GET MEAN FREQUENCY AMPLITUDE
  meanFreq = average(meanArray)

  // CONTINUE LOOP
  if (isRunning) requestAnimationFrame(draw)
}

function resizeCanvas () {
  canvas.width = window.innerWidth
  WIDTH = canvas.width
  canvas.height = window.innerHeight
  HEIGHT = canvas.height
  paintBackground()

  if (!isRunning) {
    center(splashimage, 150)
  }

  isMobile = WIDTH < breakpoint

  rays = isMobile ? 100 : 200
  radians = (Math.PI * 2) / rays
  radius = isMobile ? 100 : 150
  rayHeightFactor = isMobile ? 0.4 : 1
  if (canvasStarted && !isRunning) draw()
}

// needed a timeout since ended event always triggers too early
function destroy (timeout = 1500, e) {
  setTimeout(function () {
    if (audioctx && audioctx.state !== 'closed') {
      audioctx.close()
    }
    isRunning = false
    paintBackground()
    center(splashimage, 150)
    canvasStarted = false
    animateCenterRing()
    canvas.style.opacity = 0
    main.style.opacity = 1
    window.addEventListener('click', init)
  }, timeout)

  window.removeEventListener('click', clickHandler)
  window.removeEventListener('touchstart', clickHandler)
}
