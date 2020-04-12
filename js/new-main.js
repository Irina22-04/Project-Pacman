import {removeResultListener, renderResultsPage} from './results'
import {removeDownloadListeners, renderDownloadPage,} from './download'
import {chengeGame, closeGame, continueGame, removeGameListeners, restartGame, startGame, startPlayGame, checkGameOver, delGameOver} from './game'
import {deleteSaveListeners, showSaveDiv} from './save.js';

document.addEventListener('DOMContentLoaded', () => {

    startGame();
    hashToPage();
    window.onhashchange = hashToPage;

    return addBasicListeners();
});

function hashToPage() {
        
    if (event.oldURL) {
        switch (event.oldURL.slice(-4)) {
            case 'game':
                removeGameListeners();
                closeGame();
                checkNeedWarn(window.location.hash);
                break;
            case 'save':
                continueGame();
                deleteSaveListeners();
                break;
            case 'load':
                removeDownloadListeners();
                break;
            case 'sult':
                resetResult();
                removeResultListener();
        }
    }

    const mainPage = document.getElementById('main');
    const gamePage = document.getElementById('gameArea');
    const savePage = document.getElementById('save');
    const downloadPage = document.getElementById('download');
    const resultPage = document.getElementById('best-results');
    const pages = [mainPage, gamePage, savePage, downloadPage, resultPage];
    switch (window.location.hash.substr(1)) {
        case 'game':
            showPage(gamePage, pages);
            startPlayGame();
            break;
        case 'save':
            showPage(savePage, pages);
            showSaveDiv();
            break;
        case 'download':
            showPage(downloadPage, pages);
            renderDownloadPage();
            break;
        case 'result':
            showPage(resultPage, pages);
            delGameOver();
            return renderResultsPage();
        default:
            showPage(mainPage, pages);
            chengeGame();
            restartGame();
    }
}

function confirmExit() {
    const result = confirm('Do you want exit game?');
    if (!result) {
        playGame();
        continueGame();
    } else delGameOver();
}

function addBasicListeners() {
    const gameButton = document.getElementById('game-button');
    const downloadButton = document.getElementById('download-button');
    const mainMenuDownloadButton = document.getElementById('on-main-menu-down');
    const resultButton = document.getElementById('best-results-button');
    const mainMenuResultButton = document.getElementById('on-main-menu-result');
    const mainMenuBut = document.getElementById('main-menu-button');
    const mainMenuButton = document.getElementById('on-main-menu');

    gameButton.addEventListener('click', playGame);
    downloadButton.addEventListener('click', downloadGame);
    mainMenuDownloadButton.addEventListener('click', showMain);
    resultButton.addEventListener('click', showResult);
    mainMenuResultButton.addEventListener('click', showMain);
    mainMenuBut.addEventListener('click', showMain);
    mainMenuButton.addEventListener('click', showMain);
}

function showPage(visible, hidden) {
    hidden.forEach(item => {
        item.style.display = 'none';
    });
    visible.style.display = 'block';
}

export function playGame() {
    switchHash('game');
}

function downloadGame() {
    switchHash('download');
}

function showResult() {
    switchHash('result');
}

function showMain() {
    switchHash('main');
}

export function switchHash(hashName) {
    location.hash = hashName;
}

function resetResult() {
    const resultsDiv = document.querySelectorAll('.result');
    [...resultsDiv].forEach(item => {
        if (item.classList.contains('new-result')) {
            item.classList.remove('new-result');
        }
    })
}

function checkNeedWarn(hash) {
    hash = hash.substr(1);
    const gameOver = checkGameOver();
    if (hash === 'save' || (gameOver && hash === 'result')) {
        return;
    } else {
        confirmExit();
    }
}
