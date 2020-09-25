

const canvas = document.querySelector('canvas')
const canvasCtx = canvas.getContext('2d')

function resizeCanvas () {
  canvas.width = window.innerWidth 
  canvas.height = window.innerHeight 

}

let colorMagicNumber = 100





function draw () {
  
  let radius = 100
  let bars = 100
  canvasCtx.fillStyle = 'black'
  //canvasCtx.strokeStyle = 'pink'
  canvasCtx.lineWidth = 3
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

 

  analyser.getByteFrequencyData(freqs)
  
  
  

  for (let i = 0; i < bars; i++) {
    let radians = (Math.PI * 2) / bars
    let barHeight = freqs[i] * 1.4


    let color = `rgb(${freqs[i]}, ${colorMagicNumber - freqs[i]}, ${colorMagicNumber} )`
    //let color = `hsl(${freqs[i]}, ${colorMagicNumber - freqs[i]}, ${colorMagicNumber} )`
    
  
    let x = (canvas.width / 2) - Math.cos(radians * i) * radius
    let xEnd = (canvas.width / 2) + Math.cos(radians * i) * (radius + barHeight)
    let y = (canvas.width / 2) - Math.sin(radians * i) * radius
    let yEnd = (canvas.width / 2) + Math.sin(radians * i) * (radius + barHeight)


    canvasCtx.strokeStyle = color
    canvasCtx.fillStyle = color
    canvasCtx.beginPath()
    canvasCtx.moveTo(x , y - canvas.height/8)
    canvasCtx.lineTo(xEnd , yEnd - canvas.height/8)
    canvasCtx.stroke()
  }

  requestAnimationFrame(draw)
}


let ctx, source, analyser, freqs

canvas.addEventListener('click', init)



function init () {
  resizeCanvas()
  //const song = document.querySelector('audio')
  const song = new Audio()
  song.src = 'california.mp3'
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

function incrementColour () {

  if (colorMagicNumber > 254) {
    colorMagicNumber = colorMagicNumber % 255
  }

  colorMagicNumber++
}
