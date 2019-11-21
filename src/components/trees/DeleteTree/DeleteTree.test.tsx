import {MockedProvider} from '@apollo/react-testing';
import {render} from 'enzyme';
import React from 'react';
import DeleteTree from '.';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {Mockify} from '../../../_types//Mockify';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';

jest.mock('../../../hooks/useLang');

describe('DeleteTree', () => {
    test('Render button for system tree', async () => {
        const tree: Mockify<GET_TREES_trees_list> = {
            label: null,
            system: false
        };

        const comp = render(
            <MockedProvider>
                <MockedUserContextProvider>
                    <DeleteTree tree={tree as GET_TREES_trees_list} />
                </MockedUserContextProvider>
            </MockedProvider>
        );

        expect(comp.find('button.delete').prop('disabled')).toBe(false);
    });

    test('Disable button for system tree', async () => {
        const tree: Mockify<GET_TREES_trees_list> = {
            label: null,
            system: true
        };

        const comp = render(
            <MockedProvider>
                <MockedUserContextProvider>
                    <DeleteTree tree={tree as GET_TREES_trees_list} />
                </MockedUserContextProvider>
            </MockedProvider>
        );

        expect(comp.find('button.delete').prop('disabled')).toBe(true);
    });
});
