const canvas = document.querySelector('canvas')
const canvasCtx = canvas.getContext('2d')

function resizeCanvas () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  startBtn.style.top = `${(canvas.height / 2) - (50)}px`
startBtn.style.left = `${(canvas.width / 2) - (50)}px`
canvasCtx.fillStyle = 'orange'
canvasCtx.fillRect(0, 0, window.innerWidth, window.innerHeight)
}

let colorMagicNumber = 100





function draw () {
  
  

  let radius = 150
  if (canvas.width < 500) radius = 100
  let bars = 200
  analyser.getByteFrequencyData(freqs)

  
  //canvasCtx.fillStyle = 'darkbrown'
  //canvasCtx.strokeStyle = 'pink'
  canvasCtx.lineWidth = 4
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height)


  canvasCtx.beginPath();
  canvasCtx.arc(canvas.width/2, canvas.height/2, radius -20, 0, 2 * Math.PI);
  canvasCtx.stroke()
  canvasCtx.closePath()
  canvasCtx.strokeStyle = 'orange'
  canvasCtx.lineWidth = 2
  canvasCtx.beginPath();
  canvasCtx.arc(canvas.width/2, canvas.height/2, radius -30, 0, 2 * Math.PI);
  canvasCtx.stroke()
  canvasCtx.closePath()
  canvasCtx.lineWidth = 4
  canvasCtx.strokeStyle = 'darkorange'
  canvasCtx.beginPath();
  canvasCtx.arc(canvas.width/2, canvas.height/2, radius -40, 0, 2 * Math.PI);
  canvasCtx.stroke()
  canvasCtx.closePath()
  canvasCtx.strokeStyle = '#ff4b0d'
  canvasCtx.beginPath();
  canvasCtx.arc(canvas.width/2, canvas.height/2, radius -55, 0, 2 * Math.PI);
  canvasCtx.stroke()
  canvasCtx.closePath()
  canvasCtx.strokeStyle = 'yellow'
  canvasCtx.lineWidth = 7
  canvasCtx.beginPath();
  canvasCtx.arc(canvas.width/2, canvas.height/2, radius -70, 0, 2 * Math.PI);
  canvasCtx.stroke()
  canvasCtx.closePath()
  canvasCtx.lineWidth = 4

  
  
  
  

  for (let i = 0; i < bars; i++) {
    let radians = (Math.PI * 2) / bars
    let barHeight = freqs[i] * 1
    if (barHeight > canvas.width / 3) barHeight = freqs[i] * 0.3


    let color = `rgb(${255}, ${255 - freqs[i]}, ${0} )`
    let color2 = `rgb(${255}, ${200 - freqs[i]}, ${0} )`
    //let color = `hsl(${freqs[i]}, ${colorMagicNumber - freqs[i]}, ${colorMagicNumber} )`

    let x = (canvas.width / 2) + Math.cos(radians * i) * radius
    let xEnd = (canvas.width / 2) + Math.cos(radians * i) * (radius + barHeight)
    let y = (canvas.height / 2) + Math.sin(radians * i) * radius
    let yEnd = (canvas.height / 2) + Math.sin(radians * i) * (radius + barHeight)

    canvasCtx.strokeStyle = color
    canvasCtx.fillStyle = color2
    canvasCtx.beginPath()
    canvasCtx.moveTo(x , y)
    canvasCtx.lineTo(xEnd , yEnd )
    canvasCtx.stroke()
  }

  requestAnimationFrame(draw)
}


let ctx, source, analyser, freqs

canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvasCtx.fillStyle = 'orange'
canvasCtx.fillRect(0, 0, window.innerWidth, window.innerHeight)


const startBtn = document.createElement('button')
startBtn.innerText = 'play'
startBtn.className = 'start'
startBtn.style.top = `${(canvas.height / 2) - (50)}px`
startBtn.style.left = `${(canvas.width / 2) - (50)}px`
document.body.appendChild(startBtn)

startBtn.addEventListener('click', init)

function init () {
  startBtn.remove()
  canvas.removeEventListener('click', init)

  resizeCanvas()
  //const song = document.querySelector('audio')
  const song = new Audio()
  song.src = 'bigreveal.mp3'
  song.play()
  ctx = new (window.AudioContext || window.webkitAudioContext)()
  source = ctx.createMediaElementSource(song) // attach the audio to the context
  analyser = ctx.createAnalyser()
  source.connect(analyser)
  analyser.connect(ctx.destination) // connect to destination
  freqs = new Uint8Array(analyser.frequencyBinCount)
  draw()
}

window.addEventListener('mousemove', incrementColour)
window.addEventListener('resize', resizeCanvas)

function incrementColour () {

  if (colorMagicNumber > 254) {
    colorMagicNumber = 59
  }

  colorMagicNumber++
}
