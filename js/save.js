import {fillDownloadDiv} from './download.js';
import {playGame} from './new-main.js';

export function showSaveDiv() {
    fillDownloadDiv('save-1', 'projectPacmanSavedGame1');
    fillDownloadDiv('save-2', 'projectPacmanSavedGame2');
    fillDownloadDiv('save-3', 'projectPacmanSavedGame3');

    const continueButton = document.getElementById('continue-button');
    continueButton.addEventListener('click', playGame);
}

export function addSaveListeners(gameObj, elems, params) {
    const save1 = document.getElementById('save-1');
    const save2 = document.getElementById('save-2');
    const save3 = document.getElementById('save-3');
    const saveGame1 = saveGame.bind(null, gameObj, elems, params, 'projectPacmanSavedGame1');
    const saveGame2 = saveGame.bind(null, gameObj, elems, params, 'projectPacmanSavedGame2');
    const saveGame3 = saveGame.bind(null, gameObj, elems, params, 'projectPacmanSavedGame3');

    save1.addEventListener('click', saveGame1);
    save2.addEventListener('click', saveGame2);
    save3.addEventListener('click', saveGame3);

    deleteSaveListeners = deleteSaveListeners.bind(null, save1, save2, save3, saveGame1, saveGame2, saveGame3);
}

function saveGame(gameObj, elems, params, saveNumb) {
    const date = new Date;
    const textButton = `${day(date)}.${month(date)}.${date.getFullYear()} ${hours(date)}:${minutes(date)}`;

    const saveGameObj = JSON.stringify({
        obj: gameObj,
        textButton: textButton,
    });

    localStorage.setItem(`${saveNumb}`, saveGameObj);
    event.target.textContent = textButton;
}

function day(date) {
    return getStringDate(date.getDate());
}

function month(date) {
    return getStringDate(date.getMonth() + 1);
}

function hours(date) {
    return getStringDate(date.getHours())
}

function minutes(date) {
    return getStringDate(date.getMinutes());
}

function getStringDate(val) {
    if (val < 10) {
        val = '0' + val;
    }
    return val;
}

export function deleteSaveListeners(val1, val2, val3, func1, func2, func3) {
    if (val1) {
        val1.removeEventListener('click', func1);
        val2.removeEventListener('click', func2);
        val3.removeEventListener('click', func3);
    }

    const continueButton = document.getElementById('continue-button');
    continueButton.removeEventListener('click', playGame);
}
