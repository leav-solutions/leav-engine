// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {getVersionableAttributesByLibraryQuery} from 'graphQL/queries/attributes/getVersionableAttributesByLibrary';
import {act, render, screen} from '_tests/testUtils';
import {mockAttributeVersionable} from '__mocks__/common/attribute';
import ValuesVersionConfigurator from './ValuesVersionConfigurator';

jest.mock('hooks/ActiveLibHook/ActiveLibHook');

jest.mock('components/shared/SelectTreeNodeModal', () => {
    return function SelectTreeNodeModal() {
        return <div>SelectTreeNodeModal</div>;
    };
});

describe('VersionsPanel', () => {
    test('Render test', async () => {
        const mocks = [
            {
                request: {
                    query: getVersionableAttributesByLibraryQuery,
                    variables: {libraryId: 'test_lib'}
                },
                result: {
                    data: {
                        attributes: {
                            list: [mockAttributeVersionable],
                            __typename: 'AttributesList'
                        }
                    }
                }
            }
        ];

        render(<ValuesVersionConfigurator libraryId="test_lib" selectedVersion={null} onVersionChange={jest.fn()} />, {
            apolloMocks: mocks
        });

        expect(
            await screen.findByText(mockAttributeVersionable.versions_conf.profile.trees[0].label.fr)
        ).toBeInTheDocument();

        await act(async () => {
            userEvent.click(screen.getByText(/select_version/i));
        });

        expect(await screen.findByText(/SelectTreeNodeModal/i)).toBeInTheDocument();
    });
});
