import {Svg} from "./Dom.js";
import {RESOURCES, RES_OIL, RES_GOLD, RES_WHEAT} from "../Constants.js";

const TILE_WIDTH = 72;
const TILE_HEIGHT = Math.sqrt(3) * TILE_WIDTH / 2;

const getNormalY = (imgWidth) => {
    return (TILE_HEIGHT/3)-imgWidth;
}

const getIsEvenY = (imgWidth) => {
    return (TILE_HEIGHT/3)*2-imgWidth;
}

const getX = (imgHeight) => {
    return (TILE_HEIGHT/3)*2-imgHeight-(TILE_HEIGHT*2/3-TILE_WIDTH/2);
}

const RESOURCES_ICONS = {
    [RES_OIL]: {
        clear: '../assets/img/oil.svg',
        captured: '../assets/img/oil_captured.svg',
        normal: { x: getX(12), y: getNormalY(12) },
        isEven: { x: getX(12), y: getIsEvenY(12) },
    },
    [RES_GOLD]: {
        clear: '../assets/img/gold.svg',
        captured: '../assets/img/gold.svg',
        normal: { x: getX(16), y: getNormalY(16) },
        isEven: { x: getX(16), y: getIsEvenY(16) },
        className: 'gold-icon'
    },
    [RES_WHEAT]: {
        clear: '../assets/img/wheat.svg',
        captured: '../assets/img/wheat_captured.svg',
        normal: { x: getX(12), y: getNormalY(12) },
        isEven: { x: getX(12), y: getIsEvenY(12) },
    }
};

const makeTile = (x, y, pointsDown) => {
    const makePoly = (attrs) => {
        let relX = TILE_WIDTH / 2;
        let relY = 0;

        if (pointsDown) {
            relY += TILE_HEIGHT / 3;
        } else {
            relY += TILE_HEIGHT * 2 / 3;
        }
        return Svg('polygon', {
            'transform-origin': relX + 'px ' + relY + '0px',
            points: [
                {dx: -TILE_WIDTH / 2, dy: TILE_HEIGHT / 3},
                {dx: +TILE_WIDTH / 2, dy: TILE_HEIGHT / 3},
                {dx: 0, dy: -TILE_HEIGHT * 2 / 3},
            ].map(
                ({dx, dy}) => [
                    relX + dx,
                    relY + dy * (pointsDown ? -1 : 1),
                ].map(n => n.toFixed(3)).join(',')
            ).join(' '),
            ...attrs,
        });
    };
    return Svg('svg', {class: 'tile-root', x, y}, [
        makePoly({class: 'base-tile'}),
        makePoly({class: 'owner-overlay'}),
        makePoly({class: 'modifiers-overlay'}),
    ]);
};

const fadeInRows = (ROWS) => {
    for (let i = 0; i < ROWS; i++) {
        const css = document.styleSheets[1];
        if (i > 0) {
            css.insertRule(`
                [data-row="${i}"] {
                    animation: fadeRow 0.1s ease-in forwards;
                    animation-delay: ${i / 10}s;
                }
            `, css.cssRules.length);
        }
    }
};

export const MOD_PREFIX = 'modifier--';

/** @param {BoardState} boardState */
const updateTilesState = (boardState, getTile) => {
    for (const {row, col, modifiers, owner, improvementsBuilt} of boardState.tiles) {
        const svgEl = getTile({row, col}).svgEl;
        svgEl.classList.forEach(cls => {
            if (cls.startsWith(MOD_PREFIX)) {
                svgEl.classList.remove(cls);
            }
        });
        for (const modifier of modifiers) {
            // TODO: display multiple modifiers if any
            svgEl.classList.add(MOD_PREFIX + modifier);
        }
        if (owner) {
            svgEl.setAttribute('data-owner', owner);

            // update icon on owner change
            if (modifiers.length) {
                const resModifier = RESOURCES.find( res => modifiers.find( mod => res === mod ) );

                if (resModifier) {
                    svgEl.querySelector('.resource-icon').setAttribute('href', RESOURCES_ICONS[resModifier].captured);
                }
            }
        } else {
            svgEl.removeAttribute('data-owner');
        }
        if (improvementsBuilt > 0) {
            svgEl.querySelector('.improvement-counter').textContent = (1 + improvementsBuilt * boardState.balance.IMPROVEMENT_BONUS).toFixed(1);
        } else {
            svgEl.querySelector('.improvement-counter').textContent = '';
        }
        const stander = Object.keys(boardState.playerToPosition)
            .find(k => {
                return boardState.playerToPosition[k].row === row
                    && boardState.playerToPosition[k].col === col;
            });
        if (stander) {
            svgEl.setAttribute('data-stander', stander);
        } else {
            svgEl.removeAttribute('data-stander');
        }
    }
};

/** @param {BoardState} boardConfig */
const TileMapDisplay = (boardConfig, tileMapHolder) => {
    const matrix = {};

    const ROWS = boardConfig.totalRows;
    const BOARD_WIDTH_PX = ROWS * TILE_WIDTH;
    const BOARD_HEIGHT_PX = ROWS * TILE_HEIGHT;

    tileMapHolder.innerHTML = '';
    tileMapHolder.style.width = BOARD_WIDTH_PX + 'px';
    tileMapHolder.style.height = BOARD_HEIGHT_PX + 'px';

    // commented because it delays page reload time
    //fadeInRows(ROWS);

    for (const {row, col, modifiers, owner} of boardConfig.tiles) {
        const xPx = col * TILE_WIDTH / 2;
        const yPx = row * TILE_HEIGHT;
        const isEven = (col % 2 === 0) === (row % 2 === 0);
        const pointsDown = isEven === boardConfig.firstPointsDown;
        const svgEl = makeTile(xPx, yPx, pointsDown);
        for (const modifier of modifiers) {
            if (RESOURCES.includes(modifier)) {
                const modProps = RESOURCES_ICONS[modifier];
                const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                img.setAttribute('href', owner ? modProps.captured : modProps.clear );
                img.classList.add('resource-icon');

                if (modProps.className && modProps.className.length) {
                    img.classList.add(modProps.className);
                }

                const imgCoords = !pointsDown ? 'isEven' : 'normal';
                Object.keys(modProps[imgCoords]).forEach( k => img.style[k] = modProps[imgCoords][k] );

                svgEl.appendChild(img)
            }
        }
        svgEl.appendChild(
            Svg('text', {x: '21px', y: '36px', class: 'improvement-counter', stroke: 'lightgrey'}, ''),
        );

        svgEl.setAttribute('data-col', col);
        svgEl.setAttribute('data-row', row);

        tileMapHolder.appendChild(svgEl);

        matrix[row] = matrix[row] || {};
        matrix[row][col] = {row, col, svgEl};
    }

    return matrix;
};

TileMapDisplay.updateTilesState = updateTilesState;

export default TileMapDisplay;
