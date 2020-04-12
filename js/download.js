import {playGame} from './new-main';
import {setDownloadGame} from './game';

export function renderDownloadPage() {
    showDownloadDiv();
    return setDownloadGame();
}

function showDownloadDiv() {
    fillDownloadDiv('download-1', 'projectPacmanSavedGame1');
    fillDownloadDiv('download-2', 'projectPacmanSavedGame2');
    fillDownloadDiv('download-3', 'projectPacmanSavedGame3');
}

export function fillDownloadDiv(elementId, localStorageName) {
    const element = document.getElementById(elementId);
    const game = localStorage.getItem(localStorageName);

    return element.textContent = game ? JSON.parse(game)['textButton'] : 'empty';
}

export function addDownloadListeners(gameObj, elems, params) {
    const download1 = document.getElementById('download-1');
    const download2 = document.getElementById('download-2');
    const download3 = document.getElementById('download-3');

    const getGame1 = getGame.bind(null, gameObj, elems, params, 'projectPacmanSavedGame1');
    const getGame2 = getGame.bind(null, gameObj, elems, params, 'projectPacmanSavedGame2');
    const getGame3 = getGame.bind(null, gameObj, elems, params, 'projectPacmanSavedGame3');

    download1.addEventListener('click', getGame1);
    download2.addEventListener('click', getGame2);
    download3.addEventListener('click', getGame3);

    removeDownloadListeners = removeDownloadListeners.bind(null, download1, download2, download3, getGame1, getGame2, getGame3);
}

function getGame(gameObj, elems, params, saveNumb) {
    const game = localStorage.getItem(saveNumb);
    if (!game) {
        const elem = event.target;
        return showEmtyDownload(elem);
    }

    let savedGame = JSON.parse(localStorage.getItem(saveNumb))['obj'];

    copyGameObj(gameObj, savedGame);
    gameObj.paused = false;
    gameObj.gameExit = false;
    gameObj.finishLevel = true;

    playGame(gameObj, elems, params);
}

export function removeDownloadListeners(val1, val2, val3, func1, func2, func3) {
    const download1 = document.getElementById('download-1');
    const download2 = document.getElementById('download-2');
    const download3 = document.getElementById('download-3');

    download1.removeEventListener('click', func1);
    download2.removeEventListener('click', func2);
    download3.removeEventListener('click', func3);
}

function showEmtyDownload(elem) {
    const oldText = elem.textContent;
    elem.textContent = 'Impossible to load';
    setTimeout(stopShowEmtyDownload.bind(null, elem, oldText), 1000);
}

function copyGameObj(gameObj, savedGameObj) {
    for (let prop in gameObj) {
        if (typeof gameObj[prop] === 'boolean' || typeof gameObj[prop] === 'number' || typeof gameObj[prop] === 'string') {
            gameObj[prop] = savedGameObj[prop];
        } else if (typeof gameObj[prop] === 'object') {
            copyGameObj(gameObj[prop], savedGameObj[prop]);
        }
    }
}

function stopShowEmtyDownload(elem, text) {
    elem.textContent = text;
}