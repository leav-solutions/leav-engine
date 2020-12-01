import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IActiveTree} from '../../queries/cache/activeTree/getActiveTreeQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {useActiveTree} from './ActiveTreeHook';

describe('ActiveTreeHook', () => {
    const mockActiveTree: IActiveTree = {
        id: 'test',
        libraries: [{id: 'test'}],
        label: 'string'
    };

    test('should get undefined if no activeTree set', async () => {
        let givenActiveTree: any;

        const ComponentUsingNotification = () => {
            const [activeTree] = useActiveTree();

            givenActiveTree = activeTree;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenActiveTree).toEqual(undefined);
    });

    test('should get activeTree', async () => {
        let givenActiveTree: any;

        const ComponentUsingNotification = () => {
            const [activeTree, updateActiveTree] = useActiveTree();

            updateActiveTree(mockActiveTree);

            givenActiveTree = activeTree;
            return <></>;
        };

        await act(async () => {
            mount(
                <MockedProviderWithFragments>
                    <ComponentUsingNotification />
                </MockedProviderWithFragments>
            );
        });

        expect(givenActiveTree).toEqual(mockActiveTree);
    });
});
