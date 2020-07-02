
export const PLAYER_KEANU = 'KEANU';
export const PLAYER_TRINITY = 'TRINITY';
export const PLAYER_MORPHEUS = 'MORPHEUS';

export const RES_WHEAT = 'WHEAT';
export const RES_OIL = 'OIL';
export const RES_GOLD = 'GOLD';

export const NO_RES_EMPTY = 'EMPTY';
export const NO_RES_DEAD_SPACE = 'DEAD_SPACE';

export const MOD_WALL = 'WALL';

export const BUFF_SKIP_TURN = 'SKIP_TURN';

export const RESOURCES = [RES_WHEAT, RES_OIL, RES_GOLD];
export const PLAYER_CODE_NAMES = [PLAYER_KEANU, PLAYER_TRINITY, PLAYER_MORPHEUS];

export const RESOURCES_ICONS = {
    [RES_OIL]: {
        clear: '../assets/img/oil.svg',
        captured: '../assets/img/oil_captured.svg',
        normal: { x: 17, y: 6 },
        isEven: { x: 21, y: 22 },
    },
    [RES_GOLD]: {
        clear: '../assets/img/gold.svg',
        captured: '../assets/img/gold.svg',
        isEven: { x: 0, y: 25 },
        normal: { x: 6, y: 10 },
        className: 'gold-icon'
    },
    [RES_WHEAT]: {
        clear: '../assets/img/wheat.svg',
        captured: '../assets/img/wheat_captured.svg',
        normal: { x: 20, y: 6 },
        isEven: { x: 16, y: 22 },
    }
};

export const HTTP_PORT = 23183;
