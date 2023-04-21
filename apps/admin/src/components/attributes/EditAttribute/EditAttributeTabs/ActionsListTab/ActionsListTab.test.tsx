// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {mount} from 'enzyme';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import {act} from 'react-dom/test-utils';
import {mockAttrSimple} from '../../../../../__mocks__/attributes';
import ActionsListTab from './ActionsListTab';
import {AVAILABLE_ACTIONS_MOCK, NO_AVAILABLE_ACTION_MOCK} from './mocks/ALCMocks';

// adds the availableActions
// check that it don't crash when there's no actionList or no available actions
// feu

const wait = () => {
    return new Promise((res, rej) => {
        setTimeout(res, 0);
    });
};

describe('ActionsListTab', () => {
    test('adds the available actions ', async () => {
        let component;
        await act(async () => {
            component = mount(
                <DndProvider backend={TestBackend}>
                    <MockedProvider mocks={AVAILABLE_ACTIONS_MOCK} addTypename={false}>
                        <ActionsListTab attribute={mockAttrSimple} />
                    </MockedProvider>
                </DndProvider>
            );
        });
        await act(async () => {
            await wait();
        });
        component.update();
        const container = component.find('ALCContainer');
        const reserve = container.find('ALCReserve');
        const reserveAction = reserve.find('ALCReserveCard');
        expect(reserveAction).toHaveLength(2);
        component.unmount();
    });

    test("renders even when there's no action", async () => {
        let component;
        await act(async () => {
            component = mount(
                <DndProvider backend={TestBackend}>
                    <MockedProvider mocks={NO_AVAILABLE_ACTION_MOCK} addTypename={false}>
                        <ActionsListTab attribute={mockAttrSimple} />
                    </MockedProvider>
                </DndProvider>
            );
        });
        await act(async () => {
            await wait();
        });
        component.update();
        const container = component.find('ALCContainer');
        const reserve = container.find('ALCReserve');
        const list = container.find('ALCList');
        const reserveAction = reserve.find('ALCCard');
        expect(reserve).toHaveLength(1);
        expect(list).toHaveLength(1);
        expect(reserveAction).toHaveLength(0);
        component.unmount();
    });
});
