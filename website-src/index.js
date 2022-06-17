import * as SolarSim from "solar-sim";

const WIDTH = 1280;
const HEIGHT = 720;

let bodies = [
    {
        name: "Sun",
        mass: 5e12,
        radius: 32,
        position: [WIDTH / 2, HEIGHT / 2],
        initialVelocity: [0, 0],
        color: "#c8c800",
    },
    {
        name: "Earth",
        mass: 1e10,
        radius: 10,
        position: [WIDTH / 2 + 160, HEIGHT / 2],
        initialVelocity: [0, 1.444169311403618],
        color: "#0064c8",
    },
    {
        name: "L1",
        mass: 1,
        radius: 4,
        position: [WIDTH / 2 + 174.3684756886812, HEIGHT / 2],
        initialVelocity: [0, 1.57386005],
        color: "#969696",
    },
    {
        name: "L2",
        mass: 1,
        radius: 4,
        position: [WIDTH / 2 + 146.4437229236931, HEIGHT / 2],
        initialVelocity: [0, 1.321809565],
        color: "#969696",
    },
    {
        name: "L3",
        mass: 1,
        radius: 4,
        position: [WIDTH / 2 - 159.813705852, HEIGHT / 2],
        initialVelocity: [0, -1.444169311403618],
        color: "#4b964b",
    },
    {
        name: "L4",
        mass: 1,
        radius: 4,
        position: [WIDTH / 2 + 80, HEIGHT / 2 + (Math.sqrt(3)/2) * 160],
        initialVelocity: [-1.25180591705918, 0.7227304831872841],
        color: "#4b964b",
    },
    {
        name: "L5",
        mass: 1,
        radius: 4,
        position: [WIDTH / 2 + 80, HEIGHT / 2 - (Math.sqrt(3)/2) * 160],
        initialVelocity: [1.25180591705918, 0.7227304831872841],
        color: "#4b964b",
    },
];

let trails = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
]

for(let i = 0; i < bodies.length; i++) {
    let body = bodies[i];
    
    SolarSim.add_body(body.mass, body.position[0], body.position[1], body.initialVelocity[0], body.initialVelocity[1]);
}

const debugElem = document.getElementById("debug");
const numBodiesElem = document.getElementById("numBodies");
const simulationTickTimeElem = document.getElementById("simTickTime");
const drawTickTimeElem = document.getElementById("drawTickTime");

let count = 0;
let debug = debugElem.checked;
document.getElementById("debugSection").style.visibility = debug ? "visible" : "hidden"
debugElem.addEventListener("click", (elem, e) => {
    debug = debugElem.checked;
    if(debug) document.getElementById("debugSection").style.visibility = "visible";
    else document.getElementById("debugSection").style.visibility = "hidden";
})

const highTrailQualityElem = document.getElementById("highTrailQuality");
const mediumTrailQualityElem = document.getElementById("mediumTrailQuality");
const lowTrailQualityElem = document.getElementById("lowTrailQuality");
const noneTrailQualityElem = document.getElementById("noneTrailQuality");
const highSimAccuracyElem = document.getElementById("highSimAccuracy");
const mediumSimAccuracyElem = document.getElementById("mediumSimAccuracy");
const lowSimAccuracyElem = document.getElementById("lowSimAccuracy");

const canvas = document.getElementById("scene");
const canvas2 = document.getElementById("trails");
const ctx = canvas.getContext("2d");
const ctx2 = canvas2.getContext("2d");

let numTrailParticles = highTrailQualityElem.checked ? 100 : mediumTrailQualityElem.checked ? 50 : lowTrailQualityElem.checked ? 10 : 0;

highTrailQualityElem.addEventListener("click", (elem, e) => {
    numTrailParticles = 100;
    for(let i = 0; i < trails.length; i++) trails[i] = [];
    ctx2.clearRect(0, 0, WIDTH, HEIGHT);
});
mediumTrailQualityElem.addEventListener("click", (elem, e) => {
    numTrailParticles = 50;
    for(let i = 0; i < trails.length; i++) trails[i] = [];
    ctx2.clearRect(0, 0, WIDTH, HEIGHT);
});
lowTrailQualityElem.addEventListener("click", (elem, e) => {
    numTrailParticles = 10;
    for(let i = 0; i < trails.length; i++) trails[i] = [];
    ctx2.clearRect(0, 0, WIDTH, HEIGHT);
});
noneTrailQualityElem.addEventListener("click", (elem, e) => {
    numTrailParticles = 0;
    for(let i = 0; i < trails.length; i++) trails[i] = [];
    ctx2.clearRect(0, 0, WIDTH, HEIGHT);
});

highSimAccuracyElem.addEventListener("click", (elem, e) => { SolarSim.set_simulation_accuracy(0.05, 20) })
mediumSimAccuracyElem.addEventListener("click", (elem, e) => { SolarSim.set_simulation_accuracy(0.2, 5) })
lowSimAccuracyElem.addEventListener("click", (elem, e) => { SolarSim.set_simulation_accuracy(1.0, 1) })

let playing = true;
let tickTime = performance.now();

function step(simulate) {
    if(simulate) {
        count++;
        if(debug && count % 10 == 0) {
            numBodiesElem.innerHTML = bodies.length;
            tickTime = performance.now();
            SolarSim.step_time();
            simulationTickTimeElem.innerHTML = Math.round((performance.now() - tickTime) * 1000);
        }
        else {
            SolarSim.step_time();
        }
    }

    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    if(debug && count % 10 == 0) tickTime = performance.now();

    const newPositions = SolarSim.get_positions();
    for(let i = 0; i < bodies.length; i++) {
        let body = bodies[i];
        let inBounds = (newPositions[i * 2] >= 0 && newPositions[i * 2] < WIDTH && newPositions[i * 2 + 1] >= 0 && newPositions[i * 2 + 1] < HEIGHT);

        if(inBounds) {
            ctx.fillStyle = body.color;
            ctx.beginPath();
            ctx.arc(newPositions[i * 2], newPositions[i * 2 + 1], body.radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        if(simulate && numTrailParticles > 0 && count % (100 / numTrailParticles) == 0) {
            if(trails[i].length >= numTrailParticles || (!inBounds && trails[i].length > 0)) {
                let toRemove = trails[i].shift();
                ctx2.fillStyle = "black";
                ctx2.fillRect(toRemove[0] - 1, toRemove[1] - 1, 5, 5);
            }
            if(inBounds) {
                trails[i].push([newPositions[i * 2], newPositions[i * 2 + 1]]);
                ctx2.fillStyle = "white";
                ctx2.fillRect(newPositions[i * 2], newPositions[i * 2 + 1], 3, 3);
            }
        }
    }

    if(debug && count % 10 == 0) drawTickTimeElem.innerHTML = Math.round((performance.now() - tickTime) * 1000);

    if(playing) window.requestAnimationFrame(step);
}

const toggleButton = document.getElementById("toggle");

toggleButton.addEventListener("click", (elem, e) => {
    if(playing) {
        toggleButton.innerHTML = "Play";
    } else {
        toggleButton.innerHTML = "Pause";
        window.requestAnimationFrame(step);
    }
    playing = !playing;
});

const resetButton = document.getElementById("reset");

resetButton.addEventListener("click", (elem, e) => {
    bodies = [];
    trails = [];
    SolarSim.clear_universe();
    ctx2.clearRect(0, 0, WIDTH, HEIGHT);
})

const spawnButton = document.getElementById("spawn");

spawnButton.addEventListener("click", (elem, e) => {
    const name = document.getElementById("name").value;
    const mass = parseFloat(document.getElementById("mass").value);
    const radius = parseFloat(document.getElementById("radius").value);
    const positionX = parseFloat(document.getElementById("positionX").value);
    const positionY = parseFloat(document.getElementById("positionY").value);
    const velocityX = parseFloat(document.getElementById("velocityX").value);
    const velocityY = parseFloat(document.getElementById("velocityY").value);
    
    if(isNaN(mass) || isNaN(radius) || isNaN(positionX) || isNaN(positionY) || isNaN(velocityX) || isNaN(velocityY) || !(isFinite(mass) && isFinite(radius) && isFinite(positionX) && isFinite(positionY) && isFinite(velocityX) && isFinite(velocityY)) || Math.abs(radius) < 0.01)
        return;

    let red = Math.floor(Math.random() * 256).toString(16);
    let green = Math.floor(Math.random() * 256).toString(16);
    let blue = Math.floor(Math.random() * 256).toString(16);

    if(red.length == 1) red = "0" + red;
    if(green.length == 1) green = "0" + green;
    if(blue.length == 1) blue = "0" + blue;

    bodies.push({
        name: name,
        mass: mass,
        radius: radius,
        position: [positionX, positionY],
        initialVelocity: [velocityX, velocityY],
        color: "#" + red + green + blue,
    });

    trails.push([]);
    SolarSim.add_body(mass, positionX, positionY, velocityX, velocityY);
})

window.requestAnimationFrame(step);
