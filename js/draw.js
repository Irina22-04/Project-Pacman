export function draw(i, j, cell, hero, map, params) {
    const coefRad = params.cellSize / 15;
    const coefWall = params.cellSize / (15 / 2);
    const rad = params.cellSize / 2 - coefRad;
    const ghostColors = ['green', 'blue', 'red', 'violet'];
    const food = params.cellSize / 6;
    params._ctx.lineWidth = params.cellSize / 15;

    let x = j * params.cellSize;
    let y = i * params.cellSize;
    switch (parseInt(cell)) {
        case 0:
            params._ctx.strokeStyle = 'white';
            buildWall(map, y, x, i, j, coefWall, params);
            break;
        case 2:
            const foodOffset = (params.cellSize - food) / 2;
            params._ctx.fillStyle = 'black';
            params._ctx.fillRect(x + foodOffset, y + foodOffset, food, food);
            break;
        case 3:
            params._ctx.fillStyle = hero.immortality ? 'orange' : 'yellow';
            chooseDrawStep(hero, x, y, rad, params);
            break;
        case 4:
            const id = cell * 10 % 40;
            const ghost = hero[id];
            chooseDrawGhostStep(ghost, x, y, coefRad, rad, id, ghostColors, params);
            break;
    }
}

function buildWall(map, y, x, i, j, coef, params) {
    let view = '';
    view += (!map[i - 1] || map[i - 1][j]) ? 0 : 1;
    view += map[i][j + 1] === 0 ? 1 : 0;
    view += (!map[i + 1] || map[i + 1][j]) ? 0 : 1;
    view += map[i][j - 1] === 0 ? 1 : 0;

    checkWall(y, x, view, coef, params);
}

function checkWall(y, x, view, coef, params) {
    switch (view) {
        case '0101':
            drawHorisontalWall(y, x, coef, params);
            break;
        case '1010':
            drawVerticalWall(y, x, coef, params);
            break;
        case '0110':
            drawTopLeftAngle(y, x, coef, params);
            break;
        case '0011':
            drawTopRightAngle(y, x, coef, params);
            break;
        case '1100':
            drawBottomLeftAngle(y, x, coef, params);
            break;
        case '1001':
            drawBottomRightAngle(y, x, coef, params);
            break;
        case '0001':
            drawRightBranch(y, x, coef, params);
            break;
        case '0100':
            drawLeftBranch(y, x, coef, params);
            break;
        case '1000':
            drawBottomBranch(y, x, coef, params);
            break;
        case '0010':
            drawTopBranch(y, x, coef, params);
            break;
        case '0111':
            drawDownCross(y, x, coef, params);
            break;
        case '1101':
            drawUpCross(y, x, coef, params);
            break;
        case '1110':
            drawRightCross(y, x, coef, params);
            break;
        case '1011':
            drawLeftCross(y, x, coef, params);
            break;
    }
}

function drawLeftCross(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x + params.cellSize - coef, y);
    params._ctx.lineTo(x + params.cellSize - coef, y + params.cellSize);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x, y, coef, 0, Math.PI / 2);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x, y + params.cellSize, coef, -Math.PI / 2, 0);
    params._ctx.stroke();
}

function drawRightCross(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x + coef, y);
    params._ctx.lineTo(x + coef, y + params.cellSize);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x + params.cellSize, y, coef, Math.PI / 2, Math.PI);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x + params.cellSize, y + params.cellSize, coef, Math.PI, -Math.PI / 2);
    params._ctx.stroke();
}

function drawUpCross(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x, y + params.cellSize - coef);
    params._ctx.lineTo(x + params.cellSize, y + params.cellSize - coef);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x, y, coef, 0, Math.PI / 2);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x + params.cellSize, y, coef, Math.PI / 2, Math.PI);
    params._ctx.stroke();
}

function drawDownCross(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x, y + coef);
    params._ctx.lineTo(x + params.cellSize, y + coef);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x, y + params.cellSize, coef, -Math.PI / 2, 0);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x + params.cellSize, y + params.cellSize, coef, Math.PI, -Math.PI / 2);
    params._ctx.stroke();
}

function drawTopBranch(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x + coef, y + params.cellSize);
    params._ctx.lineTo(x + coef, y);
    params._ctx.lineTo(x + params.cellSize - coef, y);
    params._ctx.lineTo(x + params.cellSize - coef, y + params.cellSize);
    params._ctx.stroke();
}

function drawBottomBranch(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x + coef, y);
    params._ctx.lineTo(x + coef, y + params.cellSize);
    params._ctx.lineTo(x + params.cellSize - coef, y + params.cellSize);
    params._ctx.lineTo(x + params.cellSize - coef, y);
    params._ctx.stroke();
}

function drawLeftBranch(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x + params.cellSize, y + coef);
    params._ctx.lineTo(x, y + coef);
    params._ctx.lineTo(x, y + params.cellSize - coef);
    params._ctx.lineTo(x + params.cellSize, y + params.cellSize - coef);
    params._ctx.stroke();
}

function drawRightBranch(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x, y + coef);
    params._ctx.lineTo(x + params.cellSize, y + coef);
    params._ctx.lineTo(x + params.cellSize, y + params.cellSize - coef);
    params._ctx.lineTo(x, y + params.cellSize - coef);
    params._ctx.stroke();
}

function drawBottomRightAngle(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x, y + params.cellSize - coef);
    params._ctx.lineTo(x + params.cellSize - coef * 2, y + params.cellSize - coef);
    params._ctx.moveTo(x + params.cellSize - coef, y);
    params._ctx.lineTo(x + params.cellSize - coef, y + params.cellSize - coef * 2);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x + params.cellSize - coef * 2, y + params.cellSize - coef * 2, coef, 0, Math.PI / 2)
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x, y, coef, 0, Math.PI / 2);
    params._ctx.stroke();
}

function drawBottomLeftAngle(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x + coef, y);
    params._ctx.lineTo(x + coef, y + params.cellSize - 2 * coef);
    params._ctx.moveTo(x + 2 * coef, y + params.cellSize - coef);
    params._ctx.lineTo(x + params.cellSize, y + params.cellSize - coef);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x + 2 * coef, y + params.cellSize - coef * 2, coef, Math.PI / 2, Math.PI);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x + params.cellSize, y, coef, Math.PI / 2, Math.PI);
    params._ctx.stroke();
}

function drawTopRightAngle(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x, y + coef);
    params._ctx.lineTo(x + params.cellSize - coef * 2, y + coef);
    params._ctx.moveTo(x + params.cellSize - coef, y + 2 * coef);
    params._ctx.lineTo(x + params.cellSize - coef, y + params.cellSize);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x + params.cellSize - 2 * coef, y + 2 * coef, coef, -Math.PI / 2, 0);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x, y + params.cellSize, coef, -Math.PI / 2, 0);
    params._ctx.stroke();
}

function drawTopLeftAngle(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x + coef, y + coef * 2,);
    params._ctx.lineTo(x + coef, y + params.cellSize);
    params._ctx.moveTo(x + coef * 2, y + coef);
    params._ctx.lineTo(x + params.cellSize, y + coef);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x + coef * 2, y + coef * 2, coef, Math.PI, -Math.PI / 2);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.arc(x + params.cellSize, y + params.cellSize, coef, Math.PI, -Math.PI / 2);
    params._ctx.stroke();
}

function drawVerticalWall(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x + coef, y);
    params._ctx.lineTo(x + coef, y + params.cellSize);
    params._ctx.moveTo(x + params.cellSize - coef, y);
    params._ctx.lineTo(x + params.cellSize - coef, y + params.cellSize);
    params._ctx.stroke();
}

function drawHorisontalWall(y, x, coef, params) {
    params._ctx.beginPath();
    params._ctx.moveTo(x, y + coef);
    params._ctx.lineTo(x + params.cellSize, y + coef);
    params._ctx.moveTo(x, y + params.cellSize - coef);
    params._ctx.lineTo(x + params.cellSize, y + params.cellSize - coef);
    params._ctx.stroke();
}

function chooseDrawStep(hero, x, y, rad, params) {
    switch (hero.numbStep) {
        case 4:
            drawStep4(hero, x, y, rad, params);
            break;
        case 3:
            drawStep3(hero, x, y, rad, params);
            break;
        case 2:
            drawStep2(hero, x, y, rad, params);
            break;
        case 1:
            drawStep1(hero, x, y, rad, params);
            break;
    }
}

function chooseDrawGhostStep(ghost, x, y, coef, rad, id, colors, params) {
    switch (ghost.numbStep) {
        case 4:
            drawGhostStep4(ghost, x, y, coef, rad, id, colors, params);
            break;
        case 3:
            drawGhostStep3(ghost, x, y, coef, rad, id, colors, params);
            break;
        case 2:
            drawGhostStep2(ghost, x, y, coef, rad, id, colors, params);
            break;
        case 1:
            drawGhostStep1(ghost, x, y, coef, rad, id, colors, params);
            break;
    }
}

function drawStep4(hero, x, y, rad, params) {
    params._ctx.beginPath();
    x += params.cellSize / 2;
    y += params.cellSize / 2;
    switch (hero.side) {
        case 'right':
            params._ctx.arc(x, y, rad, Math.PI / 7, -Math.PI / 7);
            break;
        case 'down':
            params._ctx.arc(x, y, rad, Math.PI * 9 / 14, Math.PI * 5 / 14);
            break;
        case 'up':
            params._ctx.arc(x, y, rad, -Math.PI * 5 / 14, -Math.PI * 9 / 14);
            break;
        case 'left':
            params._ctx.arc(x, y, rad, Math.PI * 8 / 7, Math.PI * 6 / 7);
            break;
    }
    params._ctx.lineTo(x, y);
    params._ctx.fill();
}

function drawStep3(hero, x, y, rad, params) {
    params._ctx.beginPath();
    switch (hero.side) {
        case 'right':
            x -= params.cellSize / 4;
            y += params.cellSize / 2;
            params._ctx.arc(x, y, rad, Math.PI / 13, -Math.PI / 13);
            break;
        case 'down':
            x += params.cellSize / 2;
            y -= params.cellSize / 4;
            params._ctx.arc(x, y, rad, Math.PI * 15 / 26, Math.PI * 11 / 26);
            break;
        case 'up':
            x += params.cellSize / 2;
            y += 5 / 4 * params.cellSize;
            params._ctx.arc(x, y, rad, -Math.PI * 11 / 26, -Math.PI * 15 / 26);
            break;
        case 'left':
            x += 5 / 4 * params.cellSize;
            y += params.cellSize / 2;
            params._ctx.arc(x, y, rad, Math.PI * 14 / 13, Math.PI * 12 / 13);
            break;
    }
    params._ctx.lineTo(x, y);
    params._ctx.fill();
}

function drawStep2(hero, x, y, rad, params) {
    params._ctx.beginPath();
    switch (hero.side) {
        case 'right':
            y += params.cellSize / 2;
            params._ctx.arc(x, y, rad, Math.PI / 20, -Math.PI / 20);
            break;
        case 'down':
            x += params.cellSize / 2;
            params._ctx.arc(x, y, rad, Math.PI * 11 / 20, Math.PI * 9 / 20);
            break;
        case 'up':
            x += params.cellSize / 2;
            y += params.cellSize;
            params._ctx.arc(x, y, rad, -Math.PI * 9 / 20, -Math.PI * 11 / 20);
            break;
        case 'left':
            x += params.cellSize;
            y += params.cellSize / 2;
            params._ctx.arc(x, y, rad, Math.PI * 21 / 20, Math.PI * 19 / 20);
            break;
    }
    params._ctx.lineTo(x, y);
    params._ctx.fill();
}

function drawStep1(hero, x, y, rad, params) {
    params._ctx.beginPath();
    switch (hero.side) {
        case 'right':
            x += params.cellSize / 4;
            y += params.cellSize / 2;
            params._ctx.arc(x, y, rad, Math.PI / 13, -Math.PI / 13);
            break;
        case 'down':
            x += params.cellSize / 2;
            y += params.cellSize / 4;
            params._ctx.arc(x, y, rad, Math.PI * 15 / 26, Math.PI * 11 / 26);
            break;
        case 'up':
            x += params.cellSize / 2;
            y += 3 / 4 * params.cellSize;
            params._ctx.arc(x, y, rad, -Math.PI * 11 / 26, -Math.PI * 15 / 26);
            break;
        case 'left':
            x += 3 / 4 * params.cellSize;
            y += params.cellSize / 2;
            params._ctx.arc(x, y, rad, Math.PI * 14 / 13, Math.PI * 12 / 13);
            break;
    }
    params._ctx.lineTo(x, y);
    params._ctx.fill();
}

function drawGhostStep4(ghost, x, y, coef, rad, id, colors, params) {
    drawGhostRight(x, y, coef, rad, id, colors, params);
}

function drawGhostStep3(ghost, x, y, coef, rad, id, colors, params) {
    switch (ghost.moveTo) {
        case 'right':
            x -= 3 / 4 * params.cellSize;
            break;
        case 'down':
            y -= 3 / 4 * params.cellSize;
            break;
        case 'up':
            y += 3 / 4 * params.cellSize;
            break;
        case 'left':
            x += 3 / 4 * params.cellSize;
            break;
    }
    drawGhostLeft(x, y, coef, rad, id, colors, params);
}

function drawGhostStep2(ghost, x, y, coef, rad, id, colors, params) {
    switch (ghost.moveTo) {
        case 'right':
            x -= params.cellSize / 2;
            break;
        case 'down':
            y -= params.cellSize / 2;
            break;
        case 'up':
            y += params.cellSize / 2;
            break;
        case 'left':
            x += params.cellSize / 2;
            break;
    }
    drawGhostRight(x, y, coef, rad, id, colors, params);
}

function drawGhostStep1(ghost, x, y, coef, rad, id, colors, params) {
    switch (ghost.moveTo) {
        case 'right':
            x -= params.cellSize / 4;
            break;
        case 'down':
            y -= params.cellSize / 4;
            break;
        case 'up':
            y += params.cellSize / 4;
            break;
        case 'left':
            x += params.cellSize / 4;
            break;
    }
    drawGhostLeft(x, y, coef, rad, id, colors, params);
}

function drawGhostLeft(x, y, coef, rad, id, colors, params) {
    y += params.cellSize / 2;
    drawGhost(x, y, coef, rad, id, colors, params);
    x += coef;
    params._ctx.lineTo(x, y + rad / 2);
    params._ctx.lineTo(x + rad / 2, y + rad);
    params._ctx.lineTo(x + 2 * rad / 2, y + rad / 2);
    params._ctx.lineTo(x + 3 * rad / 2, y + rad);
    params._ctx.lineTo(x + 4 * rad / 2, y + rad / 2);
    params._ctx.lineTo(x + 4 * rad / 2, y);
    params._ctx.fill();
    params._ctx.fillStyle = 'white';
    params._ctx.beginPath();
    params._ctx.arc((x + rad / 2), (y - rad / 2 + coef), rad / 4, 0, Math.PI * 2);
    params._ctx.fill();
    params._ctx.beginPath();
    params._ctx.arc((x + rad / 2 * 3), (y - rad / 2 + coef), rad / 4, 0, Math.PI * 2);
    params._ctx.fill();
    params._ctx.fillStyle = 'black';
    params._ctx.beginPath();
    params._ctx.arc((x + rad * 2 / 5), (y - rad / 2 + coef), rad / 6, 0, Math.PI * 2);
    params._ctx.fill();
    params._ctx.beginPath();
    params._ctx.arc((x + rad * 7 / 5), (y - rad / 2 + coef), rad / 6, 0, Math.PI * 2);
    params._ctx.fill();
}

function drawGhostRight(x, y, coef, rad, id, colors, params) {
    y += params.cellSize / 2;
    drawGhost(x, y, coef, rad, id, colors, params);
    x += coef;
    params._ctx.lineTo(x, y + rad);
    params._ctx.lineTo(x + rad / 2, y + rad / 2);
    params._ctx.lineTo(x + 2 * rad / 2, y + rad);
    params._ctx.lineTo(x + 3 * rad / 2, y + rad / 2);
    params._ctx.lineTo(x + 4 * rad / 2, y + rad);
    params._ctx.lineTo(x + 4 * rad / 2, y);
    params._ctx.fill();
    params._ctx.fillStyle = 'white';
    params._ctx.beginPath();
    params._ctx.arc((x + rad / 2), (y - rad / 2 + coef), rad / 4, 0, Math.PI * 2);
    params._ctx.fill();
    params._ctx.beginPath();
    params._ctx.arc((x + rad / 2 * 3), (y - rad / 2 + coef), rad / 4, 0, Math.PI * 2);
    params._ctx.fill();
    params._ctx.fillStyle = 'black';
    params._ctx.beginPath();
    params._ctx.arc((x + rad * 3 / 5), (y - rad / 2 + coef), rad / 6, 0, Math.PI * 2);
    params._ctx.fill();
    params._ctx.beginPath();
    params._ctx.arc((x + rad * 8 / 5), (y - rad / 2 + coef), rad / 6, 0, Math.PI * 2);
    params._ctx.fill();
}

function drawGhost(x, y, coef, rad, id, colors, params) {
    params._ctx.fillStyle = colors[id];
    params._ctx.strokeStyle = colors[id];
    params._ctx.beginPath();
    params._ctx.arc(x + params.cellSize / 2, y, rad, 0, Math.PI, true);
    params._ctx.fill();
    x += coef;
    params._ctx.beginPath();
    params._ctx.moveTo(x, y);
    params._ctx.lineTo(x + rad * 2, y);
    params._ctx.stroke();
    params._ctx.beginPath();
    params._ctx.moveTo(x, y);
}