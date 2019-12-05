import React from 'react';
import {MockedProvider} from '@apollo/react-testing';

import {render, mount, shallow} from 'enzyme';
import {act} from 'react-dom/test-utils';
import ActionListConfigurer from './ActionListConfigurer';

import {AVAILABLE_ACTIONS_MOCK, ATTRIBUTE_MOCK, NO_AVAILABLE_ACTION_MOCK} from './mocks/ALCMocks';

// import ALCContainer from '../ActionListConfigurer/ALCContainer';

// adds the availableActions
// check that it don't crash when there's no actionList or no available actions
// feu

const wait = () => {
    return new Promise((res, rej) => {
        setTimeout(res, 0);
    });
};

describe('ActionListConfigurer', () => {
    test('adds the available actions ', async () => {
        let component;
        await act(async () => {
            component = mount(
                <MockedProvider mocks={AVAILABLE_ACTIONS_MOCK} addTypename={false}>
                    <ActionListConfigurer attribute={ATTRIBUTE_MOCK} />
                </MockedProvider>
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
                <MockedProvider mocks={NO_AVAILABLE_ACTION_MOCK} addTypename={false}>
                    <ActionListConfigurer attribute={ATTRIBUTE_MOCK} />
                </MockedProvider>
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
