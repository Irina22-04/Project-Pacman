import '@babel/polyfill';

import {ENV} from './config'

const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');

export async function readResults() {

    const url = ENV.serverURL;
    const data = {
        f: 'READ',
        n: 'BARANOVSKAYA_PROJECT_RESULT',
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: toUrlEncoded(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function lockjet(arr) {
    const url = 'http://fe.it-academy.by/AjaxStringStorage2.php';
    const data = {
        f: 'LOCKGET',
        n: 'BARANOVSKAYA_PROJECT_RESULT',
    };
    data.p = Math.random();

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: toUrlEncoded(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const json = await response.json();

        data.f = 'UPDATE';
        data.v = JSON.stringify(arr);

        return await update(data);

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function update(obj) {
    const url = 'http://fe.it-academy.by/AjaxStringStorage2.php';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: toUrlEncoded(obj),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const json = await response.json();

    } catch (error) {
        console.error('Ошибка:', error);
    }
}