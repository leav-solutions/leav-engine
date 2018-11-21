import {render} from 'enzyme';
import * as React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {GET_TREES_trees} from 'src/_gqlTypes/GET_TREES';
import {Mockify} from 'src/_types/Mockify';
import DeleteTree from '.';

describe('DeleteTree', () => {
    test('Render button for system tree', async () => {
        const tree: Mockify<GET_TREES_trees> = {
            label: null,
            system: false
        };

        const comp = render(
            <MockedProvider>
                <DeleteTree tree={tree as GET_TREES_trees} />
            </MockedProvider>
        );

        expect(comp.find('button.delete').prop('disabled')).toBe(false);
    });

    test('Disable button for system tree', async () => {
        const tree: Mockify<GET_TREES_trees> = {
            label: null,
            system: true
        };

        const comp = render(
            <MockedProvider>
                <DeleteTree tree={tree as GET_TREES_trees} />
            </MockedProvider>
        );

        expect(comp.find('button.delete').prop('disabled')).toBe(true);
    });
});
