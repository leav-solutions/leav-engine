// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import {act} from 'react-dom/test-utils';
import {mockAttrSimple} from '../../../../../__mocks__/attributes';
import ActionsListTab from './ActionsListTab';
import {AVAILABLE_ACTIONS_MOCK, NO_AVAILABLE_ACTION_MOCK} from './mocks/ALCMocks';
import {render, screen} from '_tests/testUtils';

// adds the availableActions
// check that it don't crash when there's no actionList or no available actions
// feu

jest.mock('./ALCContainer', () => {
    return function ALCContainer() {
        return <>ALCContainer</>;
    };
});

describe('ActionsListTab', () => {
    test('adds the available actions ', async () => {
        render(
            <DndProvider backend={TestBackend}>
            <MockedProvider mocks={AVAILABLE_ACTIONS_MOCK} addTypename={false}>
                <ActionsListTab attribute={mockAttrSimple} />
            </MockedProvider>
        </DndProvider>);

        expect(await screen.findByText('ALCContainer'));
    });

    test("renders even when there's no action", async () => {
        render(<DndProvider backend={TestBackend}>
            <MockedProvider mocks={NO_AVAILABLE_ACTION_MOCK} addTypename={false}>
                <ActionsListTab attribute={mockAttrSimple} />
            </MockedProvider>
        </DndProvider>);

        expect(await screen.findByText('ALCContainer'));
    });
});
