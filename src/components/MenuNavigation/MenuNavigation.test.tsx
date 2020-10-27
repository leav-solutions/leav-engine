import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {MockStateNavigation} from '../../__mocks__/Navigation/mockState';
import MenuNavigation from './MenuNavigation';

describe('MenuNavigation', () => {
    const mockPath = {id: 'pathId', library: 'libraryId'};

    test('should display path id', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockStateNavigation stateNavigation={{path: [mockPath]}}>
                    <MenuNavigation />
                </MockStateNavigation>
            );

            await wait();
            comp.update();
        });

        expect(comp.text()).toContain(mockPath.id);
    });

    test('should display path id', async () => {
        let comp: any;
        const label = 'labelPath';

        await act(async () => {
            comp = mount(
                <MockStateNavigation stateNavigation={{path: [{...mockPath, label}]}}>
                    <MenuNavigation />
                </MockStateNavigation>
            );

            await wait();
            comp.update();
        });

        expect(comp.text()).toContain(label);
    });
});
