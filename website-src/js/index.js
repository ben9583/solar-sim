import * as SolarSim from 'solar-sim'
import { randomColor } from './utils/color.js'
import { cookiesAccepted } from './utils/cookie.js'

const WIDTH = 1280
const HEIGHT = 720

let bodies = [
  {
    name: 'Sun',
    mass: 5e12,
    radius: 32,
    position: [WIDTH / 2, HEIGHT / 2],
    velocity: [0, 0],
    color: '#c8c800'
  },
  {
    name: 'Earth',
    mass: 1e10,
    radius: 10,
    position: [WIDTH / 2 + 160, HEIGHT / 2],
    velocity: [0, 1.444169311403618],
    color: '#0064c8'
  },
  {
    name: 'L1',
    mass: 1,
    radius: 4,
    position: [WIDTH / 2 + 174.3684756886812, HEIGHT / 2],
    velocity: [0, 1.57386005],
    color: '#969696'
  },
  {
    name: 'L2',
    mass: 1,
    radius: 4,
    position: [WIDTH / 2 + 146.4437229236931, HEIGHT / 2],
    velocity: [0, 1.321809565],
    color: '#969696'
  },
  {
    name: 'L3',
    mass: 1,
    radius: 4,
    position: [WIDTH / 2 - 159.813705852, HEIGHT / 2],
    velocity: [0, -1.444169311403618],
    color: '#4b964b'
  },
  {
    name: 'L4',
    mass: 1,
    radius: 4,
    position: [WIDTH / 2 + 80, HEIGHT / 2 + (Math.sqrt(3) / 2) * 160],
    velocity: [-1.25180591705918, 0.7227304831872841],
    color: '#4b964b'
  },
  {
    name: 'L5',
    mass: 1,
    radius: 4,
    position: [WIDTH / 2 + 80, HEIGHT / 2 - (Math.sqrt(3) / 2) * 160],
    velocity: [1.25180591705918, 0.7227304831872841],
    color: '#4b964b'
  }
]

let trails = [
  [],
  [],
  [],
  [],
  [],
  [],
  []
]

const dropSizeMaps = {
  small: {
    mass: 1,
    radius: 4
  },
  medium: {
    mass: 1e10,
    radius: 10
  },
  large: {
    mass: 5e12,
    radius: 32
  }
}

for (let i = 0; i < bodies.length; i++) {
  const body = bodies[i]
  SolarSim.add_body(body.mass, body.position[0], body.position[1], body.velocity[0], body.velocity[1])
}

function addBody (name, mass, radius, positionX, positionY, velocityX, velocityY) {
  if (isNaN(mass) || isNaN(radius) || isNaN(positionX) || isNaN(positionY) || isNaN(velocityX) || isNaN(velocityY) || !(isFinite(mass) && isFinite(radius) && isFinite(positionX) && isFinite(positionY) && isFinite(velocityX) && isFinite(velocityY)) || Math.abs(radius) < 0.01) { return }

  bodies.push({
    name,
    mass,
    radius,
    position: [positionX, positionY],
    velocity: [velocityX, velocityY],
    color: randomColor()
  })

  trails.push([])
  SolarSim.add_body(mass, positionX, positionY, velocityX, velocityY)
}

const debugElem = document.getElementById('debug')
const numBodiesElem = document.getElementById('numBodies')
const simulationTickTimeElem = document.getElementById('simTickTime')
const drawTickTimeElem = document.getElementById('drawTickTime')

let count = 0
let debug = debugElem.checked
document.getElementById('debugSection').style.visibility = debug ? 'visible' : 'hidden'
debugElem.addEventListener('click', (elem, e) => {
  debug = debugElem.checked
  if (debug) document.getElementById('debugSection').style.visibility = 'visible'
  else document.getElementById('debugSection').style.visibility = 'hidden'
})

const dropAdderButton = document.getElementById('dropAdderButton')
const preciseAdderButton = document.getElementById('preciseAdderButton')
const dropAdder = document.getElementById('dropAdder')
const preciseAdder = document.getElementById('preciseAdder')
dropAdderButton.checked = ''
preciseAdderButton.checked = ''

dropAdderButton.addEventListener('click', () => {
  dropAdder.style.display = 'block'
  preciseAdder.style.display = 'none'
  dropAdderEnabled = true
})

preciseAdderButton.addEventListener('click', () => {
  dropAdder.style.display = 'none'
  preciseAdder.style.display = 'block'
  dropAdderEnabled = false
})

const dropSizeSmallElem = document.getElementById('dropSizeSmall')
const dropSizeMediumElem = document.getElementById('dropSizeMedium')
const dropSizeLargeElem = document.getElementById('dropSizeLarge')

let selectedDropSize = 'medium'

dropSizeSmallElem.addEventListener('click', () => { selectedDropSize = 'small' })
dropSizeMediumElem.addEventListener('click', () => { selectedDropSize = 'medium' })
dropSizeLargeElem.addEventListener('click', () => { selectedDropSize = 'large' })

dropSizeSmallElem.checked ? selectedDropSize = 'small' : dropSizeMediumElem.checked ? selectedDropSize = 'medium' : selectedDropSize = 'large'

const highTrailQualityElem = document.getElementById('highTrailQuality')
const mediumTrailQualityElem = document.getElementById('mediumTrailQuality')
const lowTrailQualityElem = document.getElementById('lowTrailQuality')
const noneTrailQualityElem = document.getElementById('noneTrailQuality')
const highSimAccuracyElem = document.getElementById('highSimAccuracy')
const mediumSimAccuracyElem = document.getElementById('mediumSimAccuracy')
const lowSimAccuracyElem = document.getElementById('lowSimAccuracy')

const canvas = document.getElementById('scene')
const canvas2 = document.getElementById('trails')
const canvas3 = document.getElementById('placement')

const ctx = canvas.getContext('2d')
const ctx2 = canvas2.getContext('2d')
const ctx3 = canvas3.getContext('2d')

ctx3.strokeStyle = 'white'
let dropAdderEnabled = false
let mouseInCanvas = false
let mouseClicking = false
let clickedX = 0
let clickedY = 0

function getMousePos (canvas, evt) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  }
}

canvas3.addEventListener('mouseenter', () => {
  if (dropAdderEnabled) {
    mouseInCanvas = true
  }
})
canvas3.addEventListener('mouseleave', () => {
  if (dropAdderEnabled) {
    mouseInCanvas = false
    ctx3.clearRect(0, 0, WIDTH, HEIGHT)
  }
})
canvas3.addEventListener('mousedown', (elem, e) => {
  if (dropAdderEnabled) {
    mouseClicking = true
    const pos = getMousePos(canvas3, elem)

    clickedX = pos.x
    clickedY = pos.y
  }
})
canvas3.addEventListener('mouseup', (elem, e) => {
  if (dropAdderEnabled) {
    mouseClicking = false
    const pos = getMousePos(canvas3, elem)

    const distX = (clickedX - pos.x) / 25
    const distY = (clickedY - pos.y) / 25

    // const name = document.getElementById("dropName").value;
    const name = randomColor()

    addBody(name, dropSizeMaps[selectedDropSize].mass, dropSizeMaps[selectedDropSize].radius, clickedX, clickedY, distX, distY)

    step(false)
  }
})
canvas3.addEventListener('mousemove', (elem, e) => {
  if (dropAdderEnabled) {
    const pos = getMousePos(canvas3, elem)

    if (mouseInCanvas) {
      ctx3.clearRect(0, 0, WIDTH, HEIGHT)

      const radius = dropSizeMaps[selectedDropSize].radius
      if (!(isNaN(radius) || !isFinite(radius) || radius < 0.01)) {
        ctx3.beginPath()

        if (mouseClicking) {
          ctx3.arc(clickedX, clickedY, radius, 0, 2 * Math.PI)
          ctx3.moveTo(clickedX, clickedY)
          ctx3.lineTo(pos.x, pos.y)
        } else {
          ctx3.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
        }

        ctx3.stroke()
      }
    }
  }
})

let numTrailParticles = highTrailQualityElem.checked ? 100 : mediumTrailQualityElem.checked ? 50 : lowTrailQualityElem.checked ? 10 : 0

highTrailQualityElem.addEventListener('click', (elem, e) => {
  numTrailParticles = 100
  for (let i = 0; i < trails.length; i++) trails[i] = []
  ctx2.clearRect(0, 0, WIDTH, HEIGHT)
})
mediumTrailQualityElem.addEventListener('click', (elem, e) => {
  numTrailParticles = 50
  for (let i = 0; i < trails.length; i++) trails[i] = []
  ctx2.clearRect(0, 0, WIDTH, HEIGHT)
})
lowTrailQualityElem.addEventListener('click', (elem, e) => {
  numTrailParticles = 10
  for (let i = 0; i < trails.length; i++) trails[i] = []
  ctx2.clearRect(0, 0, WIDTH, HEIGHT)
})
noneTrailQualityElem.addEventListener('click', (elem, e) => {
  numTrailParticles = 0
  for (let i = 0; i < trails.length; i++) trails[i] = []
  ctx2.clearRect(0, 0, WIDTH, HEIGHT)
})

highSimAccuracyElem.addEventListener('click', (elem, e) => { SolarSim.set_simulation_accuracy(0.05, 20) })
mediumSimAccuracyElem.addEventListener('click', (elem, e) => { SolarSim.set_simulation_accuracy(0.2, 5) })
lowSimAccuracyElem.addEventListener('click', (elem, e) => { SolarSim.set_simulation_accuracy(1.0, 1) })

if (highSimAccuracyElem.checked) SolarSim.set_simulation_accuracy(0.05, 20)
else if (lowSimAccuracyElem.checked) SolarSim.set_simulation_accuracy(1.0, 1)

let playing = true
let tickTime = performance.now()

function step (simulate) {
  if (simulate) {
    count++
    if (debug && count % 10 === 0) {
      numBodiesElem.innerHTML = bodies.length
      tickTime = performance.now()
      SolarSim.step_time()
      simulationTickTimeElem.innerHTML = Math.round((performance.now() - tickTime) * 1000)
    } else {
      SolarSim.step_time()
    }
  }

  ctx.clearRect(0, 0, WIDTH, HEIGHT)

  if (debug && count % 10 === 0) tickTime = performance.now()

  const newPositions = SolarSim.get_positions()
  const newVelocities = SolarSim.get_velocities()
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i]
    const inBounds = (newPositions[i * 2] >= 0 && newPositions[i * 2] < WIDTH && newPositions[i * 2 + 1] >= 0 && newPositions[i * 2 + 1] < HEIGHT)
    const inSimBounds = (newPositions[i * 2] >= -WIDTH && newPositions[i * 2] < 2 * WIDTH && newPositions[i * 2 + 1] >= -HEIGHT && newPositions[i * 2 + 1] < 2 * HEIGHT)

    body.position[0] = newPositions[i * 2]
    body.position[1] = newPositions[i * 2 + 1]
    body.velocity[0] = newVelocities[i * 2]
    body.velocity[1] = newVelocities[i * 2 + 1]

    if (!inSimBounds) {
      ctx2.fillStyle = 'black'
      for (let j = 0; j < trails[i].length; j++) {
        ctx2.fillRect(trails[i][j][0] - 1, trails[i][j][1] - 1, 5, 5)
      }
      bodies.splice(i, 1)
      trails.splice(i, 1)
      newPositions.splice(i * 2, 2)
      SolarSim.remove_body(i)

      i--
      continue
    }

    if (inBounds) {
      ctx.fillStyle = body.color
      ctx.beginPath()
      ctx.arc(newPositions[i * 2], newPositions[i * 2 + 1], body.radius, 0, 2 * Math.PI)
      ctx.fill()
    }

    if (simulate && numTrailParticles > 0 && count % (100 / numTrailParticles) === 0) {
      if (trails[i].length >= numTrailParticles || (!inBounds && trails[i].length > 0)) {
        const toRemove = trails[i].shift()
        ctx2.fillStyle = 'black'
        ctx2.fillRect(toRemove[0] - 1, toRemove[1] - 1, 5, 5)
      }
      if (inBounds) {
        trails[i].push([newPositions[i * 2], newPositions[i * 2 + 1]])
        ctx2.fillStyle = 'white'
        ctx2.fillRect(newPositions[i * 2], newPositions[i * 2 + 1], 3, 3)
      }
    }
  }

  if (debug && count % 10 === 0) drawTickTimeElem.innerHTML = Math.round((performance.now() - tickTime) * 1000)

  if (playing && simulate) window.requestAnimationFrame(step)
}

const toggleButton = document.getElementById('toggle')

toggleButton.addEventListener('click', (elem, e) => {
  if (playing) {
    toggleButton.innerHTML = 'Play'
  } else {
    toggleButton.innerHTML = 'Pause'
    window.requestAnimationFrame(step)
  }
  playing = !playing
})

const resetButton = document.getElementById('reset')

resetButton.addEventListener('click', (elem, e) => {
  bodies = []
  trails = []
  SolarSim.clear_universe()
  ctx2.clearRect(0, 0, WIDTH, HEIGHT)

  step(false)
})

const spawnButton = document.getElementById('preciseSpawn')

spawnButton.addEventListener('click', (elem, e) => {
  // const name = document.getElementById("preciseName").value;
  const name = randomColor()
  const mass = parseFloat(document.getElementById('preciseMass').value)
  const radius = parseFloat(document.getElementById('preciseRadius').value)
  const positionX = parseFloat(document.getElementById('precisePositionX').value)
  const positionY = parseFloat(document.getElementById('precisePositionY').value)
  const velocityX = parseFloat(document.getElementById('preciseVelocityX').value)
  const velocityY = parseFloat(document.getElementById('preciseVelocityY').value)

  addBody(name, mass, radius, positionX, positionY, velocityX, velocityY)

  step(false)
})

window.requestAnimationFrame(step)

let saves = {}

const saveNameField = document.getElementById('saveName')
const saveMessageField = document.getElementById('saveMessage')
const savesList = document.getElementById('savesList')
if (cookiesAccepted()) {
  const saveString = document.cookie.split('; ').find(cookie => cookie.startsWith('configSaves='))
  if (saveString) {
    saves = JSON.parse(atob(saveString.split('=')[1]))
  }

  savesList.innerHTML = ''
  for (let i = 0; i < Object.keys(saves).length; i++) {
    savesList.innerHTML += Object.keys(saves)[i] + '<br />'
  }
}
document.getElementById('cookieAcceptance').addEventListener('click', (elem, e) => {
  if (document.getElementById('cookieAcceptance').checked) {
    document.cookie = 'configSaves=' + btoa(JSON.stringify(saves)) + ';max-age=315360000;SameSite=Strict'
  } else {
    document.cookie = 'configSaves=;max-age=0;SameSite=Strict'
  }
})

const saveButton = document.getElementById('saveButton')
saveButton.addEventListener('click', (elem, e) => {
  if (saveNameField.value.length === 0) return

  saves[saveNameField.value] = structuredClone(bodies)
  if (cookiesAccepted()) {
    document.cookie = 'configSaves=' + btoa(JSON.stringify(saves)) + ';max-age=315360000;SameSite=Strict'
  }

  savesList.innerHTML = ''
  for (let i = 0; i < Object.keys(saves).length; i++) {
    savesList.innerHTML += Object.keys(saves)[i] + '<br />'
  }
  saveMessageField.innerHTML = 'Saved as ' + saveNameField.value
  setTimeout(() => { saveMessageField.innerHTML = '' }, 3000)
})

const loadButton = document.getElementById('loadButton')
loadButton.addEventListener('click', (elem, e) => {
  const saveName = document.getElementById('saveName').value
  console.log(saves)
  if (saveName in saves) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    ctx2.clearRect(0, 0, WIDTH, HEIGHT)

    bodies = structuredClone(saves[saveName])

    trails = []
    for (let i = 0; i < bodies.length; i++) {
      trails.push([])
    }

    SolarSim.clear_universe()
    for (let i = 0; i < bodies.length; i++) {
      SolarSim.add_body(bodies[i].mass, bodies[i].position[0], bodies[i].position[1], bodies[i].velocity[0], bodies[i].velocity[1])
    }

    step(false)

    saveMessageField.innerHTML = 'Loaded ' + saveName
  } else {
    saveMessageField.innerHTML = 'No save with that name'
  }

  setTimeout(() => { saveMessageField.innerHTML = '' }, 3000)
})

const clearButton = document.getElementById('clearButton')
clearButton.addEventListener('click', (elem, e) => {
  if (clearButton.innerHTML === 'Are you sure?') {
    saves = {}
    if (cookiesAccepted()) {
      document.cookie = 'configSaves=;max-age=0;SameSite=Strict'
    }

    saveMessageField.innerHTML = 'Cleared saves'
    savesList.innerHTML = ''
  } else {
    clearButton.innerHTML = 'Are you sure?'
    setTimeout(() => { clearButton.innerHTML = 'Clear' }, 3000)
  }
})
