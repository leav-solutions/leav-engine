// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {mockAttributeVersionable} from '_ui/__mocks__/common/attribute';
import {getVersionableAttributesByLibraryQuery} from '../../_queries/attributes/getVersionableAttributesByLibrary';
import {act, render, screen, waitFor} from '../../_tests/testUtils';
import ValuesVersionConfigurator from './ValuesVersionConfigurator';

jest.mock('_ui/components/SelectTreeNodeModal', () => ({
    SelectTreeNodeModal: () => <div>SelectTreeNodeModal</div>
}));

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
                    mocks
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
                    mocks
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
