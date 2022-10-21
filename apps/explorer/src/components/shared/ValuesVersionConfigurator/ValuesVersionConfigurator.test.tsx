// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {getVersionableAttributesByLibraryQuery} from 'graphQL/queries/attributes/getVersionableAttributesByLibrary';
import {act, render, screen, waitFor} from '_tests/testUtils';
import {mockAttributeVersionable} from '__mocks__/common/attribute';
import ValuesVersionConfigurator from './ValuesVersionConfigurator';

jest.mock('hooks/ActiveLibHook/ActiveLibHook');

jest.mock('components/shared/SelectTreeNodeModal', () => {
    return function SelectTreeNodeModal() {
        return <div>SelectTreeNodeModal</div>;
    };
});

describe('VersionsPanel', () => {
    beforeEach(() => jest.clearAllMocks());

    test('Display version trees', async () => {
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

        await act(async () => {
            render(
                <ValuesVersionConfigurator
                    readOnly={false}
                    libraryId="test_lib"
                    selectedVersion={null}
                    onVersionChange={jest.fn()}
                />,
                {
                    apolloMocks: mocks
                }
            );
        });

        expect(
            await screen.findByText(mockAttributeVersionable.versions_conf.profile.trees[0].label.fr)
        ).toBeInTheDocument();

        await act(async () => {
            userEvent.click(screen.getByText(/select_version/i));
        });

        expect(await screen.findByText(/SelectTreeNodeModal/i)).toBeInTheDocument();
    });

    test('If readonly, do not open tree node selection', async () => {
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

        await act(async () => {
            render(
                <ValuesVersionConfigurator
                    readOnly
                    libraryId="test_lib"
                    selectedVersion={null}
                    onVersionChange={jest.fn()}
                />,
                {
                    apolloMocks: mocks
                }
            );
        });

        await waitFor(async () =>
            expect(
                await screen.findByText(mockAttributeVersionable.versions_conf.profile.trees[0].label.fr)
            ).toBeInTheDocument()
        );

        // expect(
        //     await screen.findByText(mockAttributeVersionable.versions_conf.profile.trees[0].label.fr)
        // ).toBeInTheDocument();

        expect(screen.getByRole('button', {name: /select_version/i})).toBeDisabled();
    });
});
