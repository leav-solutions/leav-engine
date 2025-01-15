// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import {act} from 'react-dom/test-utils';
import {wait} from 'utils/testUtils';
import ALCList from './ALCList';

function placeholder() {
    return undefined;
}

function numPlaceholder() {
    return -1;
}

const oneActionMock = {
    saveValue: {
        higherId: 0,
        0: {
            id: 'validateFormat',
            list_id: 0,
            name: 'validateFormat',
            description: 'Check if value matches attribute format',
            input_types: ['string', 'number', 'boolean', 'object'],
            output_types: ['string', 'number', 'boolean', 'object'],
            isSystem: false,
            params: []
        }
    },
    getValue: {
        higherId: 0
    },
    deleteValue: {
        higherId: 0
    }
};

const twoActionsMock = {
    saveValue: {
        higherId: 1,
        0: {
            id: 'add',
            list_id: 0,
            name: 'add',
            description: 'add input to param',
            input_types: ['number'],
            output_types: ['number'],
            isSystem: false,
            params: [
                {
                    name: 'additionner',
                    type: 'number',
                    description: 'a float or integer to add',
                    required: true,
                    helper_value: '0',
                    value: '4'
                }
            ]
        },
        1: {
            id: 'sub',
            list_id: 0,
            name: 'sub',
            description: 'substract parameter from input',
            input_types: ['number'],
            output_types: ['number'],
            isSystem: false,
            params: [
                {
                    name: 'substracter',
                    type: 'number',
                    description: 'a float or integer to substract',
                    required: true,
                    helper_value: '0',
                    value: '0.5'
                }
            ]
        }
    },
    getValue: {
        higherId: 0
    },
    deleteValue: {
        higherId: 0
    }
};

const twoIncompatibleActionsMock = {
    saveValue: {
        higherId: 1,
        0: {
            id: 'add',
            list_id: 0,
            name: 'add',
            description: 'add input to param',
            input_types: ['number'],
            output_types: ['string'],
            isSystem: false,
            params: [
                {
                    name: 'additionner',
                    type: 'number',
                    description: 'a float or integer to add',
                    required: true,
                    helper_value: '0',
                    value: '4'
                }
            ]
        },
        1: {
            id: 'sub',
            list_id: 1,
            name: 'sub',
            description: 'substract parameter from input',
            input_types: ['object'],
            output_types: ['number'],
            isSystem: false,
            params: [
                {
                    name: 'substracter',
                    type: 'number',
                    description: 'a float or integer to substract',
                    required: true,
                    helper_value: '0',
                    value: '0.5'
                }
            ]
        }
    },
    getValue: {
        higherId: 0
    },
    deleteValue: {
        higherId: 0
    }
};

function onSelectorChangeMock(event) {
    return undefined;
}

jest.mock(
    '../ALCCard',
    () =>
        function ALCCard() {
            return <div>Card</div>;
        }
);

describe('ALCList', () => {
    test('One action get instanciated in list', async () => {
        const container = await mount(
            <DndProvider backend={TestBackend}>
                <ALCList
                    actions={oneActionMock}
                    moveCard={placeholder}
                    findCard={numPlaceholder}
                    addActionToList={placeholder}
                    removeActionFromList={placeholder}
                    getNewId={numPlaceholder}
                    currentIndex={0}
                    setCurrentIndex={placeholder}
                    inType={{saveValue: ['number'], getValue: ['number'], deleteValue: ['number']}}
                    outType={{saveValue: ['number'], getValue: ['number'], deleteValue: ['number']}}
                    colorTypeDictionnary={{int: [255, 255, 255]}}
                    changeParam={placeholder}
                    cardOrder={{saveValue: [0]}}
                    onSave={placeholder}
                    currentActionListName="saveValue"
                    onSelectorChange={onSelectorChangeMock}
                />
            </DndProvider>
        );
        const cards = container.find('ALCCard');
        expect(cards).toHaveLength(1);
        container.unmount();
    });

    test('Two actions get instanciated in list', async () => {
        const container = await mount(
            <DndProvider backend={TestBackend}>
                <ALCList
                    actions={twoActionsMock}
                    moveCard={placeholder}
                    findCard={numPlaceholder}
                    addActionToList={placeholder}
                    removeActionFromList={placeholder}
                    getNewId={numPlaceholder}
                    currentIndex={0}
                    setCurrentIndex={placeholder}
                    inType={{saveValue: ['number'], getValue: ['number'], deleteValue: ['number']}}
                    outType={{saveValue: ['number'], getValue: ['number'], deleteValue: ['number']}}
                    colorTypeDictionnary={{int: [255, 255, 255]}}
                    changeParam={placeholder}
                    cardOrder={{saveValue: [0, 1]}}
                    onSave={placeholder}
                    currentActionListName="saveValue"
                    onSelectorChange={onSelectorChangeMock}
                />
            </DndProvider>
        );
        const cards = container.find('ALCCard');
        expect(cards).toHaveLength(2);
        container.unmount();
    });

    test('onSave function gives back an actionConfig when called', async () => {
        const mockSave: any = [];
        const mockOnSave = () => {
            mockSave.push(1);
            return true;
        };
        const container = await mount(
            <DndProvider backend={TestBackend}>
                <ALCList
                    actions={twoActionsMock}
                    moveCard={placeholder}
                    findCard={numPlaceholder}
                    addActionToList={placeholder}
                    removeActionFromList={placeholder}
                    getNewId={numPlaceholder}
                    currentIndex={-1}
                    setCurrentIndex={placeholder}
                    inType={{saveValue: ['number'], getValue: ['number'], deleteValue: ['number']}}
                    outType={{saveValue: ['number'], getValue: ['number'], deleteValue: ['number']}}
                    colorTypeDictionnary={{number: [0, 255, 255], string: [255, 0, 255], object: [255, 255, 0]}}
                    changeParam={placeholder}
                    cardOrder={{saveValue: [0, 1]}}
                    onSave={mockOnSave}
                    currentActionListName="saveValue"
                    onSelectorChange={onSelectorChangeMock}
                />
            </DndProvider>
        );
        container.find('button').simulate('click');
        expect(mockSave).toHaveLength(1);
        container.unmount();
    });

    test('onSave button is disabled if type chain is broken', async () => {
        // the button should not be displayed
        const mockSave: any = [];
        const mockOnSave = () => {
            mockSave.push(1);
            return true;
        };
        const container = await mount(
            <DndProvider backend={TestBackend}>
                <ALCList
                    actions={twoIncompatibleActionsMock}
                    moveCard={placeholder}
                    findCard={numPlaceholder}
                    addActionToList={placeholder}
                    removeActionFromList={placeholder}
                    getNewId={numPlaceholder}
                    currentIndex={0}
                    setCurrentIndex={placeholder}
                    inType={{saveValue: ['number'], getValue: ['number'], deleteValue: ['number']}}
                    outType={{saveValue: ['number'], getValue: ['number'], deleteValue: ['number']}}
                    colorTypeDictionnary={{number: [255, 255, 255]}}
                    changeParam={placeholder}
                    cardOrder={{saveValue: [0, 1], getValue: [], deleteValue: []}}
                    onSave={mockOnSave}
                    currentActionListName="saveValue"
                    onSelectorChange={onSelectorChangeMock}
                />
            </DndProvider>
        );

        await act(async () => {
            await wait(0);
            container.update();
        });

        const button = container.find('button');

        expect(button.props().disabled).toBe(true);

        container.unmount();
    });
});
