import {readResults} from './requests';
import {gameResult} from './game';

export async function renderResultsPage() {
    try {
        let results;
        if (gameResult.resultArr) {
            results = gameResult.resultArr;
            return writeResult(results, gameResult);
        }
        const resultsString = await readResults();
        const result = JSON.parse(resultsString.result);
        return writeResult(result, gameResult)
    } catch (e) {
        console.error('Ошибка:', e);
    }
}

function writeResult(result, obj) {
    const resultsDiv = document.querySelectorAll('.result');
    let strWriteResult = false;

    result.forEach((item, index) => {
        resultsDiv[index].querySelector(`.best-name`).textContent = item[0];
        resultsDiv[index].querySelector(`.best-score`).textContent = item[1];
        if (!strWriteResult && item[0] === obj.resultName && item[1] === obj.resultScore) {
            resultsDiv[index].classList.add('new-result');
            strWriteResult = true;
        }
    });
    addResultListener();
    obj.resultArr = null;
    obj.resultName = null;
    obj.resultScore = null;
}

function addResultListener() {
    document.addEventListener('keydown', onMainMenuButton);
}

function onMainMenuButton() {
    const onMainMenuBut = document.getElementById('on-main-menu-result');
    if (event.key === 'Enter') {
        onMainMenuBut.click();
    }
}

export function removeResultListener() {
    document.removeEventListener('keydown', onMainMenuButton);
}