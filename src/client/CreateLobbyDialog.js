import createDialog from "./Modal.js";
import {Dom} from "./Dom.js";
import Input from "./Input.js";
import Select from "./Select.js";
import {
    AI_LEAST_RECENT_TILES,
    AI_PURE_RANDOM,
    AI_RESOURCE_PATHFINDING,
    AI_SKIP_TURNS,
    BOARD_SHAPE_HEXAGON,
    BOARD_SHAPE_RANDOM,
    BOARD_SHAPE_RECTANGLE,
    BOARD_SHAPE_TRIANGLE,
    BOARD_SHAPES, generateSizeRandomExtra,
    PLAYER_CODE_NAMES,
    PLAYER_PLACEMENT_CENTERED,
    PLAYER_PLACEMENT_RANDOM,
    PLAYER_PLACEMENT_WHICHEVER,
    TOTAL_ROWS_RANDOM_EXTRA_DEFAULT
} from "../Constants.js";
import DefaultBalance from './../DefaultBalance.js';

let modal;

const makeAiBaseSelect = (player) => {
    // грустно что это не нативный селект и на него клавиатурой фокусироваться нельзя ;c
    const selectCmp = Select({
        name: 'aiBase',
        wrapperClass: player.toLocaleLowerCase(),
        options: [
            {value: AI_SKIP_TURNS, label: "No AI (Skip Turns)"},
            {value: AI_PURE_RANDOM, label: "Pure Random"},
            {value: AI_LEAST_RECENT_TILES, label: "Least Recent Tiles"},
            {value: AI_RESOURCE_PATHFINDING, label: "Resource Pathfinding"},
        ]
    });
    selectCmp.setValue(AI_LEAST_RECENT_TILES);

    return selectCmp.context;
};

const getBody = () => {
    const columns = [
        {
            label: 'Lobby Name: ',
            input: Input({autocorrect: "off", spellcheck: false, name: 'name'}),
        },
        {
            label: 'Board Size: ',
            input: Input({type: 'number', min: 4, max: 100, value: DefaultBalance().TOTAL_ROWS, name: 'TOTAL_ROWS'}),
        },
        {
            label: 'Board Size Random Extra: ',
            input: Input({type: 'number', min: 0, max: 100, value: TOTAL_ROWS_RANDOM_EXTRA_DEFAULT, name: 'TOTAL_ROWS_RANDOM_EXTRA'}),
        },
        {
            label: 'Board Shape: ',
            input: Select({
                name: "BOARD_SHAPE",
                options: [
                    {value: BOARD_SHAPE_RANDOM, label: '? Whichever'},
                    {value: BOARD_SHAPE_HEXAGON, label: '⬡ Hexagon'},
                    {value: BOARD_SHAPE_TRIANGLE, label: '▽ Triangle'},
                    {value: BOARD_SHAPE_RECTANGLE, label: '□ Rectangle'},
                ],
            }).context,
        },
        {
            label: 'Player Placement Method: ',
            input: Select({
                name: "PLAYER_PLACEMENT_METHOD",
                options: [
                    {value: PLAYER_PLACEMENT_WHICHEVER, label: '? Whichever'},
                    {value: PLAYER_PLACEMENT_CENTERED, label: 'Centered'},
                    {value: PLAYER_PLACEMENT_RANDOM, label: 'Random Tiles'},
                ],
            }).context,
        },
        // not implemented yet
        // {
        //     label: 'Play as: ',
        //     input: Select({
        //         name: "playAs",
        //         options: PLAYER_CODE_NAMES.map( name => ({label: name, value: name}) ),
        //     }).context,
        // }
    ];

    return Dom('div', {}, [
        Dom('div', {
            class: 'col-grid',
            style: 'min-width: 465px',
        }, columns.map( col => Dom('div', {
            class: 'row-grid a-i-center col-space-sm',
        }, [
            Dom('div', {class: 'col-grid flex-sm'}, [
                Dom('label', {class: 'form-label'}, col.label),
            ]),
            Dom('div', {class: 'col-grid flex-sm'}, [col.input]),
        ]))),
        Dom('div', {class: 'col-grid'}, [
            Dom('div', {
                class: 'row-grid a-i-center col-space-sm j-c-sb no-gutters-side-md',
            }, PLAYER_CODE_NAMES.map( (player, i) => Dom('div', {
                class: 'col-grid player-col m-r-md m-l-md'
            }, [
                Dom('div', {
                    class: `player-container ${player.toLocaleLowerCase()}`,
                    'data-owner': player,
                }, [
                    Dom('div', {class: 'player-title'}, player),
                    Dom('div', {}, [
                        Dom('div', {}, 'AI Base'),
                        makeAiBaseSelect(player),
                    ]),
                    Dom('label', {class: 'allow-player'}, [
                        Dom('span', {}, "Allow Players to Join"),
                        Dom('input', {
                            type: 'checkbox',
                            name: 'allowPlaceHuman',
                            checked: 'checked',
                        })
                    ]),
                ]),
            ]))),
        ]),
    ]);
};

const collectData = form => {
    return {
        name: form.querySelector('[name="name"]').value,
        //playAs: form.querySelector('[name="playAs"]').value,
        playerSlots: [...form.querySelectorAll('.player-container')].map( block => ({
            codeName: block.dataset.owner,
            aiBase: block.querySelector('[name="aiBase"]').value,
            allowPlaceHuman: block.querySelector('[name="allowPlaceHuman"]').checked,
        })),
        balance: {...DefaultBalance(),
            TOTAL_ROWS: +form.elements['TOTAL_ROWS'].value + generateSizeRandomExtra(
                form.elements['BOARD_SHAPE'].value,
                form.elements['TOTAL_ROWS_RANDOM_EXTRA'].value
            ),
            BOARD_SHAPE: form.elements['BOARD_SHAPE'].value,
        },
    };
};

const CreateLobbyDialog = ({user, api, reloadGame}) => {
    const body = getBody();
    const config = {
        title: 'CREATE LOBBY',
        body: body,
        actions: Dom('div', {class: 'row-grid j-c-right'}, [
            Dom('button', {class: 'form-btn'}, "GO"),
        ]),
    };
    modal = createDialog(config);
    modal.form.elements['name'].value = 'by ' + user.name;
    modal.form.addEventListener('submit', evt => {
        evt.preventDefault();
        const data = collectData(modal.form);
        api.createLobby(data)
            .then(result => {
                reloadGame(result);
                if (modal) {
                    modal.destroy();
                }
            })
            .catch(exc => alert('Failed to create lobby - ' + exc));
    });


    return modal;
};

export default CreateLobbyDialog;
