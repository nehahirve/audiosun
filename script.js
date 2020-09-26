let scene, camera, renderer, cube, point, plane

function init () {
  scene = new THREE.Scene() // new scene
  camera = new THREE.PerspectiveCamera( // new camera
    125,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  camera.position.z = 10

  renderer = new THREE.WebGLRenderer({ antialias: true }) // new renderer

  renderer.setSize(window.innerWidth, window.innerHeight) // set render viewport
  renderer.setPixelRatio(window.devicePixelRatio)

  document.body.appendChild(renderer.domElement) // append render cavnas

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshLambertMaterial({ color: 0x23fba0})
  cube = new THREE.Mesh(geometry, material)

  scene.add(cube)

  const ambient = new THREE.AmbientLight(0x404040, 1)
  scene.add(ambient)

  point = new THREE.PointLight(0x404040, 3)
  point.position.z = 10
  scene.add(point)

  var geometry2 = new THREE.PlaneGeometry( 200, 200, 32, 32);
  var material2 = new THREE.MeshLambertMaterial( {color: 0x1ffafa, side: THREE.DoubleSide} )
  
  plane = new THREE.Mesh( geometry2, material2 )
  //scene.add( plane )

  plane.rotation.x = 1
  plane.position.y = -10

  var size = 500;
  var divisions = 50;
  
  var gridHelper = new THREE.GridHelper( size, divisions, 'magenta', 'magenta' );
  scene.add( gridHelper )

  gridHelper.position.y = -25


  var params = {
    exposure: 1,
    bloomStrength: 1.5,
    bloomThreshold: 0,
    bloomRadius: 0
  };

  let bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
			bloomPass.threshold = params.bloomThreshold;
			bloomPass.strength = params.bloomStrength;
			bloomPass.radius = params.bloomRadius;

			composer = new THREE.EffectComposer( renderer );
			composer.addPass( renderScene );
			composer.addPass( bloomPass );


}

function animate () {
  cube.rotation.x += 0.01 // animation parameters
  cube.rotation.y += 0.01
  cube.position.z += 0.01
  renderer.render(scene, camera) // redraw
  requestAnimationFrame(animate)
}


init() // initialiaze scene
animate() // animate
window.addEventListener('resize', onResize, false) // resizes renderer and aspect ratio

function onResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix() // since we updated aspect
  renderer.setSize(window.innerWidth, window.innerHeight)
}
