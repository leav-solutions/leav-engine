import {MockedProvider} from '@apollo/client/testing';
import {act, render, screen} from '../../../_tests/testUtils';
import DeleteTree from '.';
import {type GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {type Mockify} from '../../../_types//Mockify';
import MockedUserContextProvider from '../../../__mocks__/MockedUserContextProvider';

vi.mock('../../../hooks/useLang');

describe('DeleteTree', () => {
    test('Render button for system tree', async () => {
        const tree: Mockify<GET_TREES_trees_list> = {
            label: null,
            system: false,
        };

        await act(async () => {
            render(
                <MockedProvider>
                    <MockedUserContextProvider>
                        <DeleteTree tree={tree as GET_TREES_trees_list} />
                    </MockedUserContextProvider>
                </MockedProvider>,
            );
        });

        expect(screen.getByRole('button')).not.toBeDisabled();
    });

    test('Disable button for system tree', async () => {
        const tree: Mockify<GET_TREES_trees_list> = {
            label: null,
            system: true,
        };

        await act(async () => {
            render(
                <MockedProvider>
                    <MockedUserContextProvider>
                        <DeleteTree tree={tree as GET_TREES_trees_list} />
                    </MockedUserContextProvider>
                </MockedProvider>,
            );
        });

        expect(screen.getByRole('button')).toBeDisabled();
    });
});
