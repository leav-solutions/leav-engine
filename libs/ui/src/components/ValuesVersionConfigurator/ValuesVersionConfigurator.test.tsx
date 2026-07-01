import userEvent from '@testing-library/user-event';
import {mockAttributeVersionable} from '_ui/__mocks__/common/attribute';
import {getVersionableAttributesByLibraryQuery} from '../../_queries/attributes/getVersionableAttributesByLibrary';
import {act, render, screen, waitFor} from '../../_tests/testUtils';
import ValuesVersionConfigurator from './ValuesVersionConfigurator';

vi.mock('_ui/components/SelectTreeNodeModalOld', () => ({
    SelectTreeNodeModalOld: () => <div>SelectTreeNodeModalOld</div>,
}));

describe('VersionsPanel', () => {
    beforeEach(() => vi.clearAllMocks());

    test('Display version trees', async () => {
        const mocks = [
            {
                request: {
                    query: getVersionableAttributesByLibraryQuery,
                    variables: {libraryId: 'test_lib'},
                },
                result: {
                    data: {
                        attributes: {
                            list: [mockAttributeVersionable],
                            __typename: 'AttributesList',
                        },
                    },
                },
            },
        ];

        await act(async () => {
            render(
                <ValuesVersionConfigurator
                    readOnly={false}
                    libraryId="test_lib"
                    selectedVersion={null}
                    onVersionChange={vi.fn()}
                />,
                {
                    mocks,
                },
            );
        });

        expect(
            await screen.findByText(mockAttributeVersionable.versions_conf.profile.trees[0].label.fr),
        ).toBeInTheDocument();

        await act(async () => {
            userEvent.click(screen.getByText(/select_version/i));
        });

        expect(await screen.findByText(/SelectTreeNodeModalOld/i)).toBeInTheDocument();
    });

    test('If readonly, do not open tree node selection', async () => {
        const mocks = [
            {
                request: {
                    query: getVersionableAttributesByLibraryQuery,
                    variables: {libraryId: 'test_lib'},
                },
                result: {
                    data: {
                        attributes: {
                            list: [mockAttributeVersionable],
                            __typename: 'AttributesList',
                        },
                    },
                },
            },
        ];

        await act(async () => {
            render(
                <ValuesVersionConfigurator
                    readOnly
                    libraryId="test_lib"
                    selectedVersion={null}
                    onVersionChange={vi.fn()}
                />,
                {
                    mocks,
                },
            );
        });

        await waitFor(async () =>
            expect(
                await screen.findByText(mockAttributeVersionable.versions_conf.profile.trees[0].label.fr),
            ).toBeInTheDocument(),
        );

        // expect(
        //     await screen.findByText(mockAttributeVersionable.versions_conf.profile.trees[0].label.fr)
        // ).toBeInTheDocument();

        expect(screen.getByRole('button', {name: /select_version/i})).toBeDisabled();
    });
});
