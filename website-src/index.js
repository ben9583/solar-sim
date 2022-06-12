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
        position: [WIDTH / 2 + 173.9772874357808, HEIGHT / 2],
        initialVelocity: [0, 1.592],
        color: "#969696",
    },
    {
        name: "L2",
        mass: 1,
        radius: 4,
        position: [WIDTH / 2 + 147, HEIGHT / 2],
        initialVelocity: [0, 1.29],
        color: "#969696",
    },
    {
        name: "L3",
        mass: 1,
        radius: 4,
        position: [WIDTH / 2 - 160, HEIGHT / 2],
        initialVelocity: [0, -1.444169311403618],
        color: "#4b964b",
    },
    {
        name: "L4",
        mass: 1,
        radius: 4,
        position: [WIDTH / 2 + 80, HEIGHT / 2 + (Math.sqrt(3)/2) * 160],
        initialVelocity: [-1.444169311403618 * Math.sqrt(3) / 2, 1.444169311403618 * 1/2],
        color: "#4b964b",
    },
    {
        name: "L5",
        mass: 1,
        radius: 4,
        position: [WIDTH / 2 + 80, HEIGHT / 2 - (Math.sqrt(3)/2) * 160],
        initialVelocity: [1.444169311403618 * Math.sqrt(3) / 2, 1.444169311403618 * 1/2],
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
    
    SolarSim.add_body(body.name, body.mass, body.position[0], body.position[1], body.initialVelocity[0], body.initialVelocity[1]);
}

const canvas = document.getElementById("scene");
const canvas2 = document.getElementById("trails");
const ctx = canvas.getContext("2d");
const ctx2 = canvas2.getContext("2d");

function step(simulate) {
    if(simulate) SolarSim.step_time();

    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    const newPositions = SolarSim.get_positions();
    for(let i = 0; i < bodies.length; i++) {
        let body = bodies[i];

        ctx.fillStyle = body.color;
        ctx.beginPath();
        ctx.arc(newPositions[i * 2], newPositions[i * 2 + 1], body.radius, 0, 2 * Math.PI);
        ctx.fill();

        if(simulate) {
            if(trails[i].length >= 100) {
                let toRemove = trails[i].shift();
                ctx2.fillStyle = "black";
                ctx2.fillRect(toRemove[0] - 1, toRemove[1] - 1, 5, 5);
            }
            trails[i].push([newPositions[i * 2], newPositions[i * 2 + 1]]);
            ctx2.fillStyle = "white";
            ctx2.fillRect(newPositions[i * 2], newPositions[i * 2 + 1], 3, 3);
        }
    }
}

let proc = setInterval(() => step(true), 10);
let playing = true;

const toggleButton = document.getElementById("toggle");

toggleButton.addEventListener("click", (elem, e) => {
    if(playing) {
        clearInterval(proc);
        toggleButton.innerHTML = "Play";
    } else {
        proc = setInterval(() => step(true), 10);
        toggleButton.innerHTML = "Pause";
    }
    playing = !playing;
});

const spawnButton = document.getElementById("spawn");

spawnButton.addEventListener("click", (elem, e) => {
    const name = document.getElementById("name").value;
    const mass = parseFloat(document.getElementById("mass").value);
    const radius = parseFloat(document.getElementById("radius").value);
    const positionX = parseFloat(document.getElementById("positionX").value);
    const positionY = parseFloat(document.getElementById("positionY").value);
    
    console.log("checking");
    if(isNaN(mass) || isNaN(radius) || isNaN(positionX) || isNaN(positionY) || !(isFinite(mass) && isFinite(radius) && isFinite(positionX) && isFinite(positionY)) || Math.abs(radius) < 0.01)
        return;

    console.log("success");

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
        color: "#" + red + green + blue,
    });

    trails.push([]);
    SolarSim.add_body(radius, mass, positionX, positionY, 0.2, 0.2);
    step(false);
})