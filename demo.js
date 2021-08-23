const expressionInput = document.getElementById("expr-input");
const resumeButton = document.getElementById("resume-button");
const playButton = document.getElementById("play-button");
const stepBackButton = document.getElementById("step-back");
const stepForwardButton = document.getElementById("step-forward");
const opList = document.getElementById("op-list");
const canvasDimensionsButton = document.getElementById("canvas-dims-btn");
const canvas = document.getElementById("canvas");
setCanvasDimensions(document.body.clientWidth, document.body.clientHeight);
const canvasWidthInput = document.getElementById("canvas-width");
const canvasHeightInput = document.getElementById("canvas-height");
canvasWidthInput.value = canvas.width;
canvasHeightInput.value = canvas.height;
const ctx = canvas.getContext("2d");
const animationControl = document.getElementById("animation-speed");
const wagon = document.getElementById("wagon");
let animationSpeed;
let playing = false;
let demo = null;
let intervalID;

const warning = document.getElementById("warning");

function showWarning() {
    if (demo.warning) {
        warning.style.display = 'inline';
        warning.textContent = demo.warning;
    }
    else {
        warning.style.display = 'none';
    }
}

function setSpeed(speed) {
    let step = Number.parseInt(animationControl.step);
    let max = Number.parseInt(animationControl.max);
    animationSpeed = max - speed + step;
}

setSpeed(animationControl.value);
animationControl.addEventListener('change', () => {
    setSpeed(animationControl.value);
    clearInterval(intervalID);
    runDemo();
});

function updatePlayState(state) {
    playing = state;
    resumeButton.textContent = playing ? getString("pause") : getString("resume");
}

resumeButton.addEventListener("click", () => {
    updatePlayState(!playing);
    runDemo();
});

playButton.addEventListener("click", () => {
    updatePlayState(true);
    demo = null;
    clearInterval(intervalID);
    runDemo();
});

stepBackButton.addEventListener("click", () => {
    runDemo(singleStepDirection = 'back');
});

stepForwardButton.addEventListener("click", () => {
    runDemo(singleStepDirection = 'forward');
});

function setCanvasDimensions(width, height) {
    canvas.width = width - canvas.offsetLeft;
    canvas.height = height - canvas.offsetTop;
}

canvasDimensionsButton.addEventListener("click", () => {
    let width = canvasWidthInput.value;
    let height = canvasHeightInput.value;
    setCanvasDimensions(width, height);
});

function populateOpList() {
    for (let operator of operators) {
        let li = document.createElement("li");
        li.innerHTML = `<code>${operator.op}</code>`;
        opList.appendChild(li);
    }
}
populateOpList();


function runDemo(singleStepDirection) {
    if (!demo) {
        const expr = expressionInput.value;
        demo = new EvalDemo(expr, ctx);
    }
    if (playing) {
        demo.resume();
    } else {
        demo.pause();
    }

    if (singleStepDirection) {
        let pausedState = demo.paused;
        demo.resume();
        if (singleStepDirection === 'forward') {
            demo.next();
        } else {
            demo.undo();
        }
        demo.paused = pausedState;
        showWarning();
    } else {
        intervalID = setInterval(() => {
            demo.next();
            showWarning();
            if (demo.finished()) {
                updatePlayState(false);
                clearInterval(intervalID);
            } else if (demo.paused) {
                clearInterval(intervalID);
            }

        }, animationSpeed);
    }
}
