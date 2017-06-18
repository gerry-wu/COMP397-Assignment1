
//   Source file name: main.js
//   Author: Jiawei Wu - 300856874
//   Date last Modified: 2017-06-08
//   Program description: This is a assignment 1 for COMP397 Web Game Programming. 
//   It creates a world with walls, goal, rewards, dangers. The player wins when 
//   arriving the goal and has to restart or die when hits the dangerous object.
//   Version:1.0

var stage, canvas;

//used to create the adventure world
const E = 0, W = 1, P = 2, G = 3, R = 4, RS = 5, D = 6;
const objects = ['Empty', 'Wall', 'Player', 'Goal', 'Reward', 'Restart', 'Die'];
const colors = ['white', 'orange', 'white', 'white', 'white', 'white', 'white'];
var worldMatrix = [
    [W, W, G, W, W, W, W, W, W],
    [W, E, E, E, E, E, W, E, R],
    [W, E, D, E, E, E, E, E, W],
    [W, W, W, E, E, RS, E, E, W],
    [W, R, E, E, E, W, E, E, W],
    [W, W, W, W, W, W, P, W, W]
];

// world location and size
const worldX = 200;
const worldY = 60;
const worldWidth = 576;
const worldHeight = 384;

//side of one cell of world
const side = 64;

// Shapes
var world;

//bitmap objects
var goal, player, gameover, win, restart, die;
var rewards = [];

var startPointX, startPointY; //player startpoint

var main; //The Main Background
var startB; //The Start button in the main menu

var TitleView = new createjs.Container(); //titleview when the game is ready
var InventoryView = new createjs.Container(); // inventory view when user press "I"

// keycode constant
const ARROW_KEY_LEFT = 37;
const ARROW_KEY_UP = 38;
const ARROW_KEY_RIGHT = 39;
const ARROW_KEY_DOWN = 40;
const I_KEY = 73;

// rewardBag
var rewardBag = [];

// reward rext 
var rewardText;

// tween toggle
var isTweening = false;

// This method creates the various objects that exist in the game, including the 'stage'.
function init() {
    //setup stage and ticker with 60FPS
    canvas = document.getElementById('canvas');
    stage = new createjs.Stage(canvas);
    stage.mouseEventsEnabled = true;
    createjs.Ticker.addEventListener("tick", handleTick);
    createjs.Ticker.setFPS(60);

    // make a list of all images that should be loaded.
    manifest = [
        { src: "crown.png", id: "goal" },
        { src: "egg.png", id: "reward" },
        { src: "pokeball.png", id: "restart" },
        { src: "pokeballs.png", id: "die" },
        { src: "pikachu.png", id: "player" },
        { src: "startButton.png", id: "startB" },
        { src: "bg.jpg", id: "bg" },
        { src: "main.jpg", id: "main" },
        { src: "gameOver.png", id: "gameover" },
        { src: "win.jpg", id: "win" }
    ];

    // create a special queue, and finally a handler is called when they are loaded. 
    // The queue object is provided by preloadjs.
    loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", loadingComplete);
    loader.loadManifest(manifest, true, "./images/");
}

//update stage 
function handleTick(e) {
    stage.update();
}

// create rectangle
function getRectangle(sC, fC, x, y, w, h) {
    let rectangle = new createjs.Shape();
    rectangle.graphics.beginStroke(sC);
    rectangle.graphics.beginFill(fC);
    rectangle.graphics.drawRect(0, 0, w, h);
    rectangle.x = x;
    rectangle.y = y;
    return rectangle;
}

// locate objects
function locateObject(cell, x, y) {
    switch (cell) {
        case 2:
            player.x = x;
            player.y = y;
            startPointX = x;
            startPointY = y;
            break;
        case 3:
            goal.x = x;
            goal.y = y;
            break;
        case 4:
            if (!rewards[0].x) {
                rewards[0].x = x;
                rewards[0].y = y;
            }
            else {
                rewards[1].x = x;
                rewards[1].y = y;
            }
            break;
        case 5:
            restart.x = x;
            restart.y = y;
            break;
        case 6:
            die.x = x;
            die.y = y;
            break;
        default:
            break;
    }
}

//create the world according to the matrix/data structure, and locate game objects
function getWorld(x_tl, y_tl, w, h, worldMatrix, colors, sC, nx, ny) {
    let container = new createjs.Container();
    let dx = w / nx || 1;
    let dy = h / ny || 1;
    let x = x_tl;
    let y = y_tl;

    this.worldMatrix.forEach(er => {
        er.forEach(ec => {
            fillColor = colors[ec];
            var rect = getRectangle(sC, fillColor, x, y, dx, dy);
            container.addChild(rect);
            locateObject(ec, x, y);
            x += dx;
        });
        x = x_tl;
        y += dy;
    });
    return container;
}

//create inventory view container
function getInventoryView() {
    let container = new createjs.Container();
    let bg = getRectangle("White", "Red", 0, 0, 200, 40);
    // Text to display the score and other messages.
    rewardText = new createjs.Text( "Reward: 0", "42px Arial", "#ffffff");
    container.addChild(bg, rewardText);
    container.visible = false;
    return container;
}

// create game objects after all images have been loaded
function loadingComplete() {

    main = new createjs.Bitmap(loader.getResult("main"));
    goal = new createjs.Bitmap(loader.getResult("goal"));
    player = new createjs.Bitmap(loader.getResult("player"));
    startB = new createjs.Bitmap(loader.getResult("startB"));
    bg = new createjs.Bitmap(loader.getResult("bg"));
    gameover = new createjs.Bitmap(loader.getResult("gameover"));
    win = new createjs.Bitmap(loader.getResult("win"));
    restart = new createjs.Bitmap(loader.getResult("restart"));
    die = new createjs.Bitmap(loader.getResult("die"));

    for (let i = 0; i < 2; i++) {
        rewards[i] = new createjs.Bitmap(loader.getResult("reward"));
    }
    //create world by calling getWorld
    world = getWorld(worldX, worldY, worldWidth, worldHeight, worldMatrix, colors, '#000', 9, 6);

    InventoryView = getInventoryView();

    addTitleView();
}

// add title view to stage 
function addTitleView() {
    startB.x = canvas.width / 2.5;
    startB.y = canvas.height / 2;
    startB.name = 'startB';

    TitleView.addChild(main, startB);
    stage.addChild(TitleView);

    // Start Button Listeners   
    startB.on("click", tweenTitleView);
}

// Tween Title View
function tweenTitleView() {
    createjs.Tween.get(TitleView).to({ y: -1000 }, 300).call(addGameView);
}

// remove title view and add game view to stage
function addGameView() {
    // Destroy Menu screen
    stage.removeChild(TitleView);
    TitleView = null;

    // Add Game View
    stage.addChild(bg, world, goal, rewards[0], rewards[1], restart, die, player, InventoryView);

    //Call startGame
    startGame();
}

function startGame(e) {
    window.onkeydown = onDPad;
}

//handle key press
function onDPad(e) {
    if (isTweening == false) {
        let newPlayerX = player.x;
        let newPlayerY = player.y;

        switch (e.keyCode) {
            case ARROW_KEY_LEFT:
                newPlayerX -= side;
                break;
            case ARROW_KEY_UP:
                newPlayerY -= side;
                break;
            case ARROW_KEY_RIGHT:
                newPlayerX += side;
                break;
            case ARROW_KEY_DOWN:
                newPlayerY += side;
                break;
            case I_KEY:
                if (InventoryView.visible == false)
                    InventoryView.visible = true
                else
                    InventoryView.visible = false
                break;
        }
        if (isMoveValid(newPlayerX, newPlayerY)) {
            setNewLocation(newPlayerX, newPlayerY);
        }
        else {
            alert("Not a valid move!");
        }

    }

}

//check if the move is valid(against the wall)
function isMoveValid(newPlayerX, newPlayerY) {
    let cells = world.children;
    let isValid = true;

    //check if it move over the container
    // "world" x = 200, "world"" y = 60, "world" width = 576, " world" height = 384
    if (newPlayerX >= (worldX + worldWidth) || newPlayerY >= (worldY + worldHeight) || newPlayerX < worldX || newPlayerY < worldY)
        isValid = false;

    //check if it is on the allowed cell
    cells.forEach(er => {
        if (er.graphics._fill.style == "orange") {
            if ((er.x == newPlayerX) && (er.y == newPlayerY)) {
                isValid = false;
            }
        }
    });
    return isValid;
}

//tween player to new location 
function setNewLocation(newPlayerX, newPlayerY) {
    isTweening = true;
    createjs.Tween.get(player).to({ x: newPlayerX, y: newPlayerY }, 500).call(afterTweening).call(checkSpecialCell, [newPlayerX, newPlayerY], this);
}

// set isTweenking to false afater finish
function afterTweening() {
    isTweening = false;
}

function checkSpecialCell(newPlayerX, newPlayerY) {

    //check if player hits a reward
    rewards.forEach(er => {
        if ((newPlayerX == er.x) && (newPlayerY == er.y) && er.visible == true) {
            rewardBag.push("egg");
            er.visible = false;
            rewardText.text = "Reward: " + rewardBag.length;
        }
    });

    // check if player arrives goal
    if ((newPlayerX == goal.x) && (newPlayerY == goal.y)) {

        //add win icon to stage and add tween to win icon
        stage.removeAllChildren();
        win.y = 100;
        stage.addChild(win);
        createjs.Tween.get(win).to({ x: 500 }, 1000).to({ x: 250 }, 1000);
    }

    // check if player hits restart
    if (newPlayerX == restart.x && newPlayerY == restart.y) {
        rewardBag = [];
        rewardText.text = "Reward: " + rewardBag.length;
        rewards.forEach(er => {
            er.visible = true;
        });
        player.x = startPointX;
        player.y = startPointY;
    }

    // check if player hits die
    if (newPlayerX == die.x && newPlayerY == die.y) {
        stage.removeAllChildren();
        gameover.y = 100;
        stage.addChild(gameover);
        createjs.Tween.get(gameover).to({ x: 300 }, 1000).to({ x: 100 }, 1000);
    }
}