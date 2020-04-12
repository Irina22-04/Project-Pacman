import {gameMaps, Ghost, Pacman} from "./elements";
import {draw} from './draw.js';
import {switchHash} from './new-main.js';
import {addSaveListeners} from './save.js';
import {addDownloadListeners} from './download';
import {lockjet, readResults} from './requests';
import {convertResultsToArray} from './results';
import 'hammerjs';

export function startGame() {

    const game = {
        hero: new Pacman,
        enemies: {},
    };
    createGameObj(game);
    prepareLevel(game);
    const drawParams = createDrawParams(game);

    const fieldElems = {
        levelDiv: document.getElementById('level'),
        scoreDiv: document.getElementById('score'),
        livesDiv: document.getElementById('lives'),
        signDiv: document.getElementById('sign-div'),
        addSignDiv: document.getElementById('not-div'),
        audioFood: document.getElementById('food'),
        audioDead: document.getElementById('dead'),
        audioSound: document.getElementById('sound'),
        audioGameOver: document.getElementById('game-over'),
        audioWin: document.getElementById('win'),
        audioComplete: document.getElementById('complete'),
        ms: new Hammer(document.body),
    };

    fieldElems.ms.get('swipe').set({
        threshold: 1,
        velocity: 0.1,
        direction: Hammer.DIRECTION_ALL,
    });

    resizeGame = resizeGame.bind(null, game, drawParams, fieldElems);
    window.addEventListener('resize', resizeGame);
    window.addEventListener('orientationchange', resizeGame);
    const soundButton = document.getElementById('sound-button');
    soundButton.addEventListener('click', swichSound.bind(null, game, fieldElems));

    bindFunc(game, fieldElems, drawParams);
}

function bindFunc(gameObj, elems, params) {
    closeGame = closeGame.bind(null, gameObj, elems, params);
    startPlayGame = startPlayGame.bind(null, gameObj, elems, params);
    startLevel = startLevel.bind(null, gameObj, elems, params);
    pausedGame = pausedGame.bind(null, gameObj, elems, params);
    checkStep = checkStep.bind(null, gameObj);
    renderSavePage = renderSavePage.bind(null, gameObj, elems, params);
    removeGameListeners = removeGameListeners.bind(null, gameObj, elems, params);
    setDownloadGame = setDownloadGame.bind(null, gameObj, elems, params);
    chengeGame = chengeGame.bind(null, gameObj);
    continueGame = continueGame.bind(null, gameObj, elems, params);
    restartGame = restartGame.bind(null, gameObj);
    checkSwipeStep = checkSwipeStep.bind(null, gameObj);
    checkGameOver = checkGameOver.bind(null, gameObj);
    delGameOver = delGameOver.bind(null, gameObj);
}

export function startPlayGame(gameObj, elems, params) {
    if (gameObj.paused) {
        return;
    }

    if (gameObj.gameExit) {
        gameObj.hero.numbStep = 4;
        gameObj.hero.moveTo = 'right';
        gameObj.hero.side = 'right';
        gameObj.hero.startGame = true;
        gameObj.hero.immortality = 0;
        for (let ghost in gameObj.enemies) {
            gameObj.enemies[ghost].numbStep = 4;
            gameObj.enemies[ghost].stepFood = false;
        }
        createGameObj(gameObj);
        gameObj.gameExit = false;
        prepareLevel(gameObj);
    }

    const val = localStorage.getItem('projectPacmanSound');
    if (val === 'true') {
        gameObj.soundOff = true;
    } else {
        gameObj.soundOff = false;
    }

    setFieldElemsValaues(gameObj, elems);
    if (!gameObj.gameOver) {
        showStartLevel(gameObj, elems, params);
        deleteInput();
    }
}

function setFieldElemsValaues(game, fieldElems) {
    fieldElems.levelDiv.textContent = `Level: ${game.levelGame}`;
    fieldElems.scoreDiv.textContent = `Score: ${game.score}`;
    fieldElems.livesDiv.textContent = `Lives: ${game.lives}`;
}

function createGameObj(gameObj) {
    gameObj.paused = false;
    gameObj.timer = null;
    gameObj.levelGame = 1;
    gameObj.lives = 3;
    gameObj.score = 0;
    gameObj.finishLevel = true;
    gameObj.gameExit = false;
    gameObj.map = copyMap(gameMaps[gameObj.levelGame - 1]);
    gameObj.soundOff = false;
}

function copyMap(arr) {
    const newArr = [];
    arr.forEach(item => newArr.push(item.slice()));
    return newArr;
}

function prepareLevel(gameObj) {
    for (let i = 0; i < gameObj.map.length; i++) {
        for (let j = 0; j < gameObj.map[i].length; j++) {
            const cell = gameObj.map[i][j];
            let hero;
            switch (parseInt(cell)) {
                case 3:
                    hero = gameObj.hero;
                    hero.y = i;
                    hero.x = j;
                    break;
                case 4:
                    const id = gameObj.map[i][j] * 10 % 40;
                    if (!(id in gameObj.enemies)) {
                        gameObj.enemies[id] = new Ghost;
                    }
                    gameObj.enemies[id].y = i;
                    gameObj.enemies[id].x = j;
                    hero = gameObj.enemies;
                    break;
            }
        }
    }
}

function createDrawParams(gameObj) {
    const drawParams = {
        _canv: document.getElementById('canvas'),
    };
    drawParams._ctx = drawParams._canv.getContext('2d');
    resizeGame(gameObj, drawParams);
    return drawParams;
}

function resizeGame(gameObj, params, elems) {
    const gameArea = document.getElementById('gameArea');
    const widthToHeight = 4 / 5;

    let newWidth = document.documentElement.clientWidth;
    let newHeight = document.documentElement.clientHeight;

    const newWidthToHeight = newWidth / newHeight;

    if (newWidthToHeight > widthToHeight) {
        newWidth = newHeight * widthToHeight;
        gameArea.style.height = newHeight - 10 + 'px';
        gameArea.style.width = newWidth + 'px';
    } else {
        newHeight = newWidth / widthToHeight;
        gameArea.style.width = newWidth + 'px';
        gameArea.style.height = newHeight - 10 + 'px';
    }

    chooseCellSize(gameObj, params, newWidth, newHeight);

    params._canv.width = gameObj.map[0].length * params.cellSize;
    params._canv.height = gameObj.map.length * params.cellSize;

    params._canv.style.left = (parseFloat(gameArea.style.width) - params._canv.width) / 2 + 'px';
    params._canv.style.top = (parseFloat(gameArea.style.height) - params._canv.height) / 2 + 'px';

    if (gameObj.paused || gameObj.finishLevel) {
        requestAnimationFrame(drawGame.bind(null, gameObj, params, elems));
    }
}

function chooseCellSize(gameObj, params, width, height) {
    const cellWidth = width / gameObj.map[0].length;
    const cellHeight = height * (4 / 5) / gameObj.map.length;
    params.cellSize = parseInt(Math.min(cellWidth, cellHeight));
}

function drawGame(gameObj, params, elems) {
    let food = 0;
    params._ctx.clearRect(0, 0, params._canv.width, params._canv.height);
    params._ctx.fillStyle = 'darkblue';
    params._ctx.fillRect(0, 0, params._canv.width, params._canv.height);
    for (let i = 0; i < gameObj.map.length; i++) {
        for (let j = 0; j < gameObj.map[i].length; j++) {
            const cell = gameObj.map[i][j];
            let hero;
            switch (parseInt(cell)) {
                case 2:
                    food++;
                    break;
                case 3:
                    hero = gameObj.hero;
                    break;
                case 4:
                    const id = gameObj.map[i][j] * 10 % 40;
                    hero = gameObj.enemies;
                    if (gameObj.enemies[id].stepFood) {
                        food++;
                    }
                    break;
            }
            draw(i, j, cell, hero, gameObj.map, params);
        }
    }

    if (checkFinishLevel(food, gameObj)) {
        stopGame(gameObj, elems, showLevelComplete, params);
    }

    if (!gameObj.finishLevel && !gameObj.paused) {
        requestAnimationFrame(drawGame.bind(null, gameObj, params, elems));
    }
}

export function chengeGame(gameObj) {
    gameObj.paused = false;
}

function checkFinishLevel(val, gameObj) {
    return !val && gameObj.hero.numbStep === 4 && !gameObj.finishLevel;
}

function stopGame(gameObj, elems, func, params) {
    clearInterval(gameObj.timer);
    gameObj.finishLevel = true;

    const pauseButton = document.getElementById('pause-button');
    pauseButton.removeEventListener('click', pausedGame);
    document.removeEventListener('keydown', checkStep);
    elems.ms.off('swipeup swipedown swipeleft swiperight');

    if (!gameObj.soundOff) {
        elems.audioSound.pause();
    }
    func(gameObj, elems, params);
}

function showLevelComplete(gameObj, elems, params) {
    const saveButton = document.getElementById('save-button');
    saveButton.removeEventListener('click', showSaveGame);
    saveButton.addEventListener('click', buttonBlur);

    const pauseButton = document.getElementById('pause-button');
    pauseButton.addEventListener('click', buttonBlur);

    elems.audioComplete.play();
    elems.signDiv.classList.add('visible', 'big');
    elems.signDiv.textContent = 'Level complete';
    elems.timer = setTimeout(stopShowLevelComplete.bind(null, gameObj, elems, params), 2000);
}

export function pausedGame(gameObj, elems, params) {
    if (!gameObj.finishLevel) {
        applyPause(gameObj, elems, params);
    }
    event.target.blur();
}

function stopShowLevelComplete(gameObj, elems, params) {
    elems.signDiv.classList.remove('visible', 'big');
    if (gameMaps[gameObj.levelGame]) {
        prepareGameObj(gameObj, elems, params);
    } else {
        gameObj.gameOver = true;
        elems.signDiv.textContent = 'You win!';
        return stopGame(gameObj, elems, showGameOver);
    }
}

function prepareGameObj(gameObj, elems, params) {
    gameObj.paused = false;
    gameObj.levelGame += 1;
    gameObj.map = copyMap(gameMaps[gameObj.levelGame - 1]);
    gameObj.hero.side = 'right';
    gameObj.hero.moveTo = 'right';
    gameObj.hero.startGame = true;
    for (let ghost in gameObj.enemies) {
        gameObj.enemies[ghost].numbStep = 4;
        gameObj.enemies[ghost].stepFood = false;
    }

    elems.levelDiv.textContent = `Level: ${gameObj.levelGame}`;
    prepareLevel(gameObj);
    showStartLevel(gameObj, elems, params);
}

function showStartLevel(gameObj, elems, params) {
    drawGame(gameObj, params, elems);
    elems.signDiv.classList.add('visible');
    elems.addSignDiv.classList.add('visible');
    elems.signDiv.textContent = `Level ${gameObj.levelGame}`;

    document.addEventListener('keydown', startLevel);
    elems.ms.on('swipeup swipedown swipeleft swiperight', startLevel);

    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', showSaveGame);
    saveButton.removeEventListener('click', buttonBlur);

    const pauseButton = document.getElementById('pause-button');
    pauseButton.addEventListener('click', buttonBlur);

    const soundBut = document.getElementById('sound-button');
    if (gameObj.soundOff) {
        soundBut.classList.add('line-through-text');
    } else {
        soundBut.classList.remove('line-through-text');
    }
}

function startLevel(gameObj, elems, params) {
    if (event.key === 'Enter' || event.type === 'pointerup') {
        document.removeEventListener('keydown', startLevel);
        elems.ms.off('swipeup swipedown swipeleft swiperight');

        const pauseButton = document.getElementById('pause-button');
        pauseButton.addEventListener('click', pausedGame);
        pauseButton.removeEventListener('click', buttonBlur);

        document.addEventListener('keydown', checkStep);
        elems.ms.on('swipeup swipedown swipeleft swiperight', (ev) => checkSwipeStep(ev.type));

        elems.signDiv.classList.remove('visible');
        elems.addSignDiv.classList.remove('visible');
        gameObj.finishLevel = false;
        requestAnimationFrame(drawGame.bind(null, gameObj, params, elems));
        gameObj.timer = setInterval(gameFunc.bind(null, gameObj, elems), 70);

        elems.audioSound.currentTime = 0.0;
        elems.audioSound.play();

        if (gameObj.soundOff) {
            elems.audioSound.muted = true;
            const audioElems = document.querySelectorAll('audio');
            Array.from(audioElems).forEach(item => {
                item.muted = true;

            })
        } else {
            elems.audioSound.muted = false;
            const audioElems = document.querySelectorAll('audio');
            Array.from(audioElems).forEach(item => {
                item.muted = false;
            })
        }
    }
}

function gameFunc(gameObj, elems) {

    if (gameObj.hero.startGame) {
        gameObj.map[gameObj.hero.y][gameObj.hero.x] = 3;
    }

    if (!gameObj.hero.startGame) {
        move(gameObj, gameObj.hero, checkMove, elems);
    }

    Array.from(Object.entries(gameObj.enemies)).forEach(item => move(gameObj, item[1], checkGhostMove, elems, item[0]));

    if (gameObj.hero.immortality > 0 && gameObj.hero.immortality < 20) {
        gameObj.hero.immortality++;
    } else if (gameObj.hero.immortality > 19) {
        gameObj.hero.immortality = 0;
    }
}

function buttonBlur() {
    event.target.blur();
}

function checkStep(gameObj) {
    switch (event.keyCode) {
        case 37:
            leftStep(gameObj.map, gameObj.hero);
            break;
        case 39:
            rightStep(gameObj.map, gameObj.hero);
            break;
        case 38:
            upStep(gameObj.map, gameObj.hero);
            break;
        case 40:
            downStep(gameObj.map, gameObj.hero);
            break;
        case 80:
            pausedGame();
            break;
    }
}

function checkSwipeStep(gameObj, direction) {
    switch (direction) {
        case 'swipeleft':
            leftStep(gameObj.map, gameObj.hero);
            break;
        case 'swiperight':
            rightStep(gameObj.map, gameObj.hero);
            break;
        case 'swipeup':
            upStep(gameObj.map, gameObj.hero);
            break;
        case 'swipedown':
            downStep(gameObj.map, gameObj.hero);
            break;
    }
}

function checkLeftStep(map, hero) {
    return map[hero.y][hero.x - 1];
}

function leftStep(map, hero) {
    if (checkLeftStep(map, hero)) {
        hero.startGame = false;
        hero.moveTo = 'left';
    }
}

function checkRightStep(map, hero) {
    return (map[hero.y][hero.x + 1]);
}

function rightStep(map, hero) {
    if (checkRightStep(map, hero)) {
        hero.startGame = false;
        hero.moveTo = 'right';
    }
}

function checkUpStep(map, hero) {
    return map[hero.y - 1][hero.x];
}

function upStep(map, hero) {
    if (checkUpStep(map, hero)) {
        hero.startGame = false;
        hero.moveTo = 'up';
    }
}

function checkDownStep(map, hero) {
    return map[hero.y + 1][hero.x];
}

function downStep(map, hero) {
    if (checkDownStep(map, hero)) {
        hero.startGame = false;
        hero.moveTo = 'down';
    }
}

function move(gameObj, hero, funcCheckMove, elems, id) {
    switch (hero.numbStep) {
        case 4:
            funcCheckMove(gameObj, hero, elems, id);
            break;
        case 3:
            hero.chengeStep();
            break;
        case 2:
            hero.chengeStep();
            break;
        case 1:
            hero.chengeStep();
            break;
    }
}

function checkMove(gameObj, hero, elems) {
    hero.side = hero.moveTo;
    switch (hero.side) {
        case 'right':
            if (checkRightStep(gameObj.map, hero,)) {
                checkGhostMeet(gameObj, hero, 0, 1, elems);
                checkFoodCell(gameObj, hero, 0, 1, elems);
                hero.step(0, 1, gameObj.map);
            }
            break;
        case 'left':
            if (checkLeftStep(gameObj.map, hero)) {
                checkGhostMeet(gameObj, hero, 0, -1, elems);
                checkFoodCell(gameObj, hero, 0, -1, elems);
                hero.step(0, -1, gameObj.map);
            }
            break;
        case 'up':
            if (checkUpStep(gameObj.map, hero)) {
                checkGhostMeet(gameObj, hero, -1, 0, elems);
                checkFoodCell(gameObj, hero, -1, 0, elems);
                hero.step(-1, 0, gameObj.map);
            }
            break;
        case 'down':
            if (checkDownStep(gameObj.map, hero)) {
                checkGhostMeet(gameObj, hero, 1, 0, elems);
                checkFoodCell(gameObj, hero, 1, 0, elems);
                hero.step(1, 0, gameObj.map);
            }
            break;
    }
}

function checkGhostMeet(gameObj, hero, y, x, elems) {
    if ((parseInt(gameObj.map[hero.y + y][hero.x + x])) === 4) {
        hero.numbStep = 4;
        takeLive(gameObj, elems);
        hero.immortality++;
        hero.startGame = true;
    }
}

function takeLive(gameObj, elems) {
    if (!gameObj.lives) {
        elems.signDiv.textContent = 'Game over';
        gameObj.gameOver = true;
        return stopGame(gameObj, elems, showGameOver);
    }
    if (!gameObj.hero.immortality) {
        elems.audioDead.play();
        gameObj.lives--;
        elems.livesDiv.textContent = `Lives: ${gameObj.lives}`;
    }
}

function showGameOver(gameObj, elems) {
    const saveButton = document.getElementById('save-button');
    saveButton.removeEventListener('click', showSaveGame);
    saveButton.addEventListener('click', buttonBlur);

    elems.signDiv.classList.add('visible', 'big');
    elems.addSignDiv.classList.add('visible');
    if (elems.signDiv.textContent === 'Game over') {
        elems.audioGameOver.currentTime = 0.0;
        elems.audioGameOver.play();
    } else {
        elems.audioWin.currentTime = 0.0;
        elems.audioWin.play();
    }
    stopShowGameOver = stopShowGameOver.bind(null, gameObj, elems);
    document.addEventListener('keydown', stopShowGameOver);
    document.addEventListener('click', stopShowGameOver);
    elems.ms.on('swipeup swipedown swipeleft swiperight', stopShowGameOver)
}

function stopShowGameOver(gameObj, elems) {
    elems.signDiv.classList.remove('visible', 'big');
    elems.addSignDiv.classList.remove('visible');
    const pauseButton = document.getElementById('pause-button');
    pauseButton.removeEventListener('click', buttonBlur);
    document.removeEventListener('keydown', stopShowGameOver);
    document.removeEventListener('click', stopShowGameOver);
    elems.ms.off('swipeup swipedown swipeleft swiperight');
    if (!gameObj.soundOff) {
        switch (elems.signDiv.textContent) {
            case 'Game over':
                elems.audioGameOver.pause();
                break;
            default:
                elems.audioWin.pause();
        }
        checkResult(gameObj);
    }
}

function checkFoodCell(gameObj, hero, y, x, elems) {
    if (gameObj.map[hero.y + y][hero.x + x] === 2) {
        elems.audioFood.play();
        gameObj.map[hero.y + y][hero.x + x] = 1;
        gameObj.score += 1;
        elems.scoreDiv.textContent = `Score: ${gameObj.score}`;
    }
}

function showSaveGame() {
    switchHash('save');
    renderSavePage();
}

function checkGhostMove(gameObj, hero, elems, id) {
    const view = [];
    const up = ((hero.moveTo === 'down') || (parseInt(gameObj.map[hero.y - 1][hero.x]) === 4)) ? 0 : gameObj.map[hero.y - 1][hero.x];
    view.push(up);
    const left = ((hero.moveTo === 'right') || (parseInt(gameObj.map[hero.y][hero.x - 1]) === 4)) ? 0 : gameObj.map[hero.y][hero.x - 1];
    view.push(left);
    const down = ((hero.moveTo === 'up') || (parseInt(gameObj.map[hero.y + 1][hero.x]) === 4)) ? 0 : gameObj.map[hero.y + 1][hero.x];
    view.push(down);
    const right = ((hero.moveTo === 'left') || (parseInt(gameObj.map[hero.y][hero.x + 1]) === 4)) ? 0 : gameObj.map[hero.y][hero.x + 1];
    view.push(right);

    let side;
    if (view.every(index => !!index === false)) {
        side = reverseStep(hero, gameObj.map);
    } else {
        side = Math.floor(Math.random() * 4);

        if (!view[side]) {
            return checkGhostMove(gameObj, hero, elems, id);
        }
    }

    return getGhostSide(gameObj, hero, side, id, elems);
}

function getGhostSide(gameObj, hero, side, id, elems) {
    switch (side) {
        case 0:
            hero.moveTo = 'up';
            checkPacmanMeet(gameObj, hero, -1, 0, elems);
            hero.step(-1, 0, id, gameObj.map);
            break;
        case 1:
            hero.moveTo = 'left';
            checkPacmanMeet(gameObj, hero, 0, -1, elems);
            hero.step(0, -1, id, gameObj.map);
            break;
        case 2:
            hero.moveTo = 'down';
            checkPacmanMeet(gameObj, hero, 1, 0, elems);
            hero.step(1, 0, id, gameObj.map);
            break;
        case 3:
            hero.moveTo = 'right';
            checkPacmanMeet(gameObj, hero, 0, 1, elems);
            hero.step(0, 1, id, gameObj.map);
            break;
        case 4:
            hero.step(0, 0, id, gameObj.map);
            break;
    }
}

function checkPacmanMeet(gameObj, hero, y, x, elems) {
    if (gameObj.map[hero.y + y][hero.x + x] === 3) {
        takeLive(gameObj, elems);
        gameObj.hero.immortality++;
        gameObj.hero.numbStep = 4;
        gameObj.hero.startGame = true;
    }
}

function reverseStep(hero, gameMap) {
    switch (hero.moveTo) {
        case 'left':
            return (!gameMap[hero.y][hero.x + 1] || (parseInt(gameMap[hero.y][hero.x + 1]) === 4)) ? 4 : 3;
        case 'right':
            return (!gameMap[hero.y][hero.x - 1] || (parseInt(gameMap[hero.y][hero.x - 1]) === 4)) ? 4 : 1;
        case 'up':
            return (!gameMap[hero.y + 1][hero.x] || (parseInt(gameMap[hero.y + 1][hero.x]) === 4)) ? 4 : 2;
        case 'down':
            return (!gameMap[hero.y - 1][hero.x] || (parseInt(gameMap[hero.y - 1][hero.x]) === 4)) ? 4 : 0;
    }
}

function applyPause(gameObj, elems, params) {
    elems.signDiv.classList.toggle("visible");
    if (!gameObj.paused) {
        gameObj.paused = true;
        clearInterval(gameObj.timer);
        elems.signDiv.textContent = 'PAUSE';
        if (!gameObj.soundOff) {
            elems.audioSound.pause();
        }
    } else if (gameObj.paused && !gameObj.finishLevel) {
        gameObj.paused = false;
        gameObj.timer = setInterval(gameFunc.bind(null, gameObj, elems), 70);
        requestAnimationFrame(drawGame.bind(null, gameObj, params, elems));
        elems.audioSound.play();
    }
}

export function removeGameListeners(gameObj, elems, params) {
    clearTimeout(elems.timer);

    window.removeEventListener('resize', resizeGame);
    document.removeEventListener('keydown', startLevel);
    document.removeEventListener('keydown', checkStep);
    elems.ms.off('swipeup swipedown swipeleft swiperight');

    if (!gameObj.paused) {
        pausedGame(gameObj, elems, params);
        elems.audioSound.pause();
    }
}

export function closeGame(gameObj, elems, params) {

    clearTimeout(elems.timer);
    document.removeEventListener('keydown', startLevel);
    document.removeEventListener('keydown', checkStep);
    elems.ms.off('swipeup swipedown swipeleft swiperight');

    const pauseButton = document.getElementById('pause-button');
    pauseButton.removeEventListener('click', pausedGame);

    if (!gameObj.paused) {
        pausedGame(gameObj, elems, params);
        elems.audioSound.pause();
    }

    gameObj.gameExit = true;
}

export function setDownloadGame(gameObj, elems, params) {
    return addDownloadListeners(gameObj, elems, params);
}

function renderSavePage(gameObj, elems, params) {
    return addSaveListeners(gameObj, elems, params);
}

export function continueGame(gameObj, elems, params) {
    if (gameObj.finishLevel) {
        document.addEventListener('keydown', startLevel);
        elems.ms.on('swipeup swipedown swipeleft swiperight', startLevel);
        gameObj.paused = false;
    } else {
        document.addEventListener('keydown', checkStep);
        elems.ms.on('swipeup swipedown swipeleft swiperight', checkSwipeStep);
        const pauseButton = document.getElementById('pause-button');
        pauseButton.addEventListener('click', pausedGame);
    }
    gameObj.gameExit = false;
}

async function checkResult(gameObj) {
    try {
        const resultsString = await readResults();
        const result = JSON.parse(resultsString.result);
        return writeNewResult(result, gameObj);
    } catch (e) {
        console.error('Ошибка:', e);
    }
}

function writeNewResult(results, gameObj) {
    if ((results[results.length - 1][1] > gameObj.score) && results.length >= 10) {
        gameResult.resultArr = results;
        return switchHash('result');
    }
    const writeResultDiv = document.getElementById('write-result');
    writeResultDiv.classList.add('visible');
    const newPlayerNameInput = document.getElementById('player-name');
    newPlayerNameInput.value = "";
    newPlayerNameInput.focus();
    const enterResultButton = document.getElementById('result-button');
    checkButtonForResult = checkButtonForResult.bind(null, enterResultButton);
    savePlayerName = savePlayerName.bind(null, results, gameObj);
    document.addEventListener('keydown', checkButtonForResult);
    enterResultButton.addEventListener('click', savePlayerName);
}

function checkButtonForResult(button) {
    if (event.key === 'Enter') {
        button.click();
    }
}

export function savePlayerName(results, gameObj) {
    event.target.blur();
    deleteInput();

    const newPlayerNameInput = document.getElementById('player-name');
    const newPlayerName = newPlayerNameInput.value ? newPlayerNameInput.value : 'anonymouse';
    newPlayerNameInput.value = "";
    gameResult.resultName = newPlayerName;
    gameResult.resultScore = gameObj.score;

    const newResult = [newPlayerName, gameObj.score];

    results.push(newResult);
    results.sort((a, b) => (b[1] - a[1]));
    if (results.length > 10) {
        results.pop();
    }
    gameResult.resultArr = results;
    switchHash('result');
    return lockjet(results);
}

export function deleteInput() {
    const writeResultDiv = document.getElementById('write-result');
    writeResultDiv.classList.remove('visible');
    document.removeEventListener('keydown', checkButtonForResult);
    const enterResultButton = document.getElementById('result-button');
    enterResultButton.removeEventListener('click', savePlayerName);
}

export const gameResult = {
    resultArr: null,
    resultName: null,
    resultScore: null,
};

function swichSound(gameObj, elems) {
    gameObj.soundOff = !gameObj.soundOff;

    localStorage.setItem('projectPacmanSound', gameObj.soundOff);
    const soundBut = document.getElementById('sound-button');

    const audioElems = document.querySelectorAll('audio');
    if (gameObj.soundOff) {
        Array.from(audioElems).forEach(item => {
            item.muted = true;
        });
        elems.audioSound.muted = true;
        soundBut.classList.add('line-through-text');
    } else {
        Array.from(audioElems).forEach(item => {
            item.muted = false;
        });
        elems.audioSound.muted = false;
        soundBut.classList.remove('line-through-text');
    }

    const soundButton = document.getElementById('sound-button');
    soundButton.blur();
}

export function restartGame(gameObj) {
    gameObj.levelGame = 1;
}

export function checkGameOver(gameObj) {
    return 'gameOver' in gameObj;
}

export function delGameOver(gameObj) {
    delete gameObj.gameOver;
}
