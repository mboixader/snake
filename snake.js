let speedX = 1;
let speedY = 0;
let bufferedX = 1;
let bufferedY = 0;

let currentInput = null;

let tilesRows = 10;
let tilesCols = 30;
let maxFruits = 5;
let maxBombs = 2;
let boardTiles; //Array de objetos donde cada pos tiene un {x:0 , y:0} por ejemplo
let snakePositions; //Array de todas las pos
let fruitPositions = [];
let bombPositions = [];

//si toco borde se me quita la última parte de la serp
//las bombas me quitan la mitad de la serp
//hay 5 frutas a la vez en todo momento 

document.addEventListener('DOMContentLoaded', function () {
    // document.addEventListener("keydown", changeDirection);
    window.focus();
    catchInput();
    startGame();
});

function startGame(){
    createBoard();
    createGrid();
    spawnSerp();
    spawnFruits();
    spawnBombs();
    paintTiles();
    startGameTimer();
}

function startGameTimer(){
    setInterval(() => {
        updateBufferedDirs();
        let checkOfNextPost = checkSerpColision();

        if (checkOfNextPost.content === "collision"){
            killSnake();
        }   
        else if (checkOfNextPost.content === "fruit"){
            moveSerp();
            eatFruit(checkOfNextPost.pos);
        }
        else if (checkOfNextPost.content === "bomb"){
            moveSerp();
            eatBomb(checkOfNextPost.pos);
        }
        else if (checkOfNextPost.content === "empty"){
            moveSerp();
        }
        else if (checkOfNextPost.content === "border"){
            shrinkSerp(1);
        }

        spawnFruits();
        spawnBombs();
        paintTiles();
        
    }, 200);
}

function eatFruit(fruitPos) {
    snakePositions.push([]);

    let index = fruitPositions.findIndex(pos =>
        pos.x === fruitPos.x &&
        pos.y === fruitPos.y
    );

    if (index !== -1) {
        fruitPositions.splice(index, 1);
    }
}

function eatBomb() {
    shrinkSerp(snakePositions.length/2);
}

function checkSerpColision() {
    let futureSerpPos = {x: snakePositions[0].x + speedX , y: snakePositions[0].y + speedY};

    if (snakePositions.find(pos => pos.x === futureSerpPos.x && pos.y === futureSerpPos.y)) {
        return {content : "collision", pos : futureSerpPos};
    }
    else if (fruitPositions.find(pos => pos.x === futureSerpPos.x && pos.y === futureSerpPos.y)) {
        return {content : "fruit", pos : futureSerpPos};
    }
    else if (bombPositions.find(pos => pos.x === futureSerpPos.x && pos.y === futureSerpPos.y)) {
        return {content : "bomb", pos : futureSerpPos};
    }
    else if (findTileIndex(futureSerpPos) != -1){
        return {content : "empty", pos : futureSerpPos};
    }
    return {content : "border", pos : futureSerpPos};
}

function createGrid() {
    const grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = `repeat(${tilesCols}, 20px)`;
    grid.style.gridTemplateRows = `repeat(${tilesRows}, 20px)`;

    for (let i = 0; i < (tilesRows*tilesCols); i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.id = i;
        grid.appendChild(cell);
    }    
}

function spawnSerp() {
    snakePositions = [{
        x : Math.floor(tilesCols/2),
        y : Math.floor(tilesRows/2)
    }];
}

function spawnFruits() {
    for (let index = fruitPositions.length; index < maxFruits; index++) {
        let tile = pickRandomEmptyTile(); 
        fruitPositions.push(tile);
    }
}

function spawnBombs() {
    for (let index = bombPositions.length; index < maxBombs; index++) {
        let tile = pickRandomEmptyTile(); 
        bombPositions.push(tile);
    }
}




function pickRandomEmptyTile() {
    let busyTiles = [...snakePositions, ...fruitPositions];

    let filteredArray = boardTiles.filter(tile =>
        !busyTiles.some(busyTile =>
            busyTile.x === tile.x &&
            busyTile.y === tile.y
        )
    );

    if (filteredArray.length === 0) {
        return null;
    }

    let randomPos = filteredArray[
        Math.floor(Math.random() * filteredArray.length)
    ];

    return randomPos;
}


function moveSerp(){
    for (let i = snakePositions.length - 1; i > 0; i--) {
        snakePositions[i].x = snakePositions[i-1].x
        snakePositions[i].y = snakePositions[i-1].y
    }

    snakePositions[0].x = snakePositions[0].x + speedX;
    snakePositions[0].y = snakePositions[0].y + speedY;
}

function shrinkSerp(amount){
    snakePositions.splice(-amount);
    if (snakePositions.length <= 0){
        killSnake();
    }
}

function killSnake() {
    window.location.reload();
}

function createBoard() {
    boardTiles = [];

    for (let y = 0; y < tilesRows; y++) {
        for (let x = 0; x < tilesCols; x++) {
            boardTiles.push({
                x: x,
                y: y
            });
        }
    }
}

function findTileIndex(positionObject) {
    let indexInBoard = boardTiles.findIndex(
        tile => tile.x === positionObject.x && tile.y === positionObject.y
    );
    
    return indexInBoard
}

function paintTiles(){
    document.querySelectorAll("div.cell").forEach(cell => {
        cell.style.backgroundColor = "";
    });
    paintSnakeTiles();
    paintFruitTiles();
    paintBombTiles();
}

function paintSnakeTiles() {
    snakePositions.forEach(positionObj => {
        let indexInBoard = findTileIndex(positionObj)

        let cell = document.getElementById(indexInBoard);
        if (cell != null){
            cell.style.backgroundColor = "black";
        }
    });
}

function paintFruitTiles(){
    fruitPositions.forEach(positionObj => {
        let indexInBoard = findTileIndex(positionObj)

        let cell = document.getElementById(indexInBoard);
        cell.style.backgroundColor = "red";        
    });   
}

function paintBombTiles() {
    bombPositions.forEach(positionObj => {
        let indexInBoard = findTileIndex(positionObj)

        let cell = document.getElementById(indexInBoard);
        cell.style.backgroundColor = "grey";        
    });      
}

// function changeDirection(e) {
//     if (e.code == "ArrowUp" && speedY != 1) { 
//         speedX = 0;
//         speedY = -1;            
//     }
//     else if (e.code == "ArrowDown" && speedY != -1) {
//         speedX = 0;
//         speedY = 1;
//     }
//     else if (e.code == "ArrowLeft" && speedX != 1) {
//         speedX = -1;
//         speedY = 0;
//     }
//     else if (e.code == "ArrowRight" && speedX != -1) { 
//         speedX = 1;
//         speedY = 0;
//     }
// }

function changeDirection(input) {
    if (input == "ArrowUp" && speedY != 1) { 
        bufferedX = 0;
        bufferedY = -1;            
    }
    else if (input == "ArrowDown" && speedY != -1) {
        bufferedX = 0;
        bufferedY = 1;
    }
    else if (input == "ArrowLeft" && speedX != 1) {
        bufferedX = -1;
        bufferedY = 0;
    }
    else if (input == "ArrowRight" && speedX != -1) { 
        bufferedX = 1;
        bufferedY = 0;
    }
}

function updateBufferedDirs() {
    speedX = bufferedX;
    speedY = bufferedY; 
}

function catchInput() {
    let pressedKeys = [];

    document.addEventListener("keydown", (e) => {
        if (
            e.code.startsWith("Arrow") &&
            !pressedKeys.includes(e.code)
        ) {
            pressedKeys.push(e.code);
        }
    });

    document.addEventListener("keyup", (e) => {
        if (e.code.startsWith("Arrow")) {
            pressedKeys = pressedKeys.filter(key => key !== e.code);
        }
    });

    setInterval(() => {
        if (pressedKeys.length > 0) {
            changeDirection(pressedKeys[pressedKeys.length - 1]);
        }
    }, 1);
}