import {type ApolloError} from '@apollo/client';
import {render, screen} from '_ui/_tests/testUtils';
import * as gqlTypes from '_ui/_gqlTypes';
import {type IEntrypointLibrary, type IEntrypointLink} from './_types';
import {ExplorerTitle} from './ExplorerTitle';

const libraryEntrypoint: IEntrypointLibrary = {type: 'library', libraryId: 'campaigns'};
const linkEntrypoint: IEntrypointLink = {
    type: 'link',
    parentLibraryId: 'campaigns',
    parentRecordId: '42',
    linkAttributeId: 'link_attribute',
};

const mockLinkAttributeQuery = (overrides: Partial<ReturnType<typeof gqlTypes.useExplorerLinkAttributeQuery>> = {}) =>
    vi.spyOn(gqlTypes, 'useExplorerLinkAttributeQuery').mockReturnValue({
        data: undefined,
        loading: false,
        error: undefined,
        ...overrides,
    } as unknown as ReturnType<typeof gqlTypes.useExplorerLinkAttributeQuery>);

describe('ExplorerTitle', () => {
    beforeEach(() => {
        mockLinkAttributeQuery();
    });

    test('renders the given title as-is, without querying anything', () => {
        render(
            <ExplorerTitle
                title="My title"
                libraryLabel={null}
                isLibraryLabelLoading={false}
                entrypoint={libraryEntrypoint}
            />,
        );

        expect(screen.getByText('My title')).toBeInTheDocument();
    });

    test('shows a loader while the library label is loading', () => {
        const {container} = render(
            <ExplorerTitle libraryLabel={null} isLibraryLabelLoading entrypoint={libraryEntrypoint} />,
        );

        expect(container.querySelector('.ant-skeleton')).toBeInTheDocument();
    });

    test('shows the localized library label once resolved', () => {
        render(
            <ExplorerTitle
                libraryLabel={{fr: 'Campagnes', en: 'Campaigns'}}
                isLibraryLabelLoading={false}
                entrypoint={libraryEntrypoint}
            />,
        );

        expect(screen.getByText('Campagnes')).toBeInTheDocument();
    });

    // Regression: the library metadata query's error used to be silently dropped (folded away when
    // `useExplorerLibraryDetailsQuery` — which fed this branch — was replaced by
    // `useExplorerLibraryMetadata`), so a genuine query failure fell through to "Unknown library"
    // exactly like a bad id, losing the distinction between the two.
    test('shows the library metadata query error instead of falling through to "Unknown library"', () => {
        render(
            <ExplorerTitle
                libraryLabel={null}
                isLibraryLabelLoading={false}
                libraryError={{message: 'Network error'} as ApolloError}
                entrypoint={libraryEntrypoint}
            />,
        );

        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(screen.queryByText('Unknown library')).not.toBeInTheDocument();
    });

    test('falls back to "Unknown library" when the label is missing without an error (bad id)', () => {
        render(<ExplorerTitle libraryLabel={null} isLibraryLabelLoading={false} entrypoint={libraryEntrypoint} />);

        expect(screen.getByText('Unknown library')).toBeInTheDocument();
    });

    test('shows the link attribute query error for a link entrypoint', () => {
        mockLinkAttributeQuery({error: {message: 'Link attribute error'} as ApolloError});

        render(<ExplorerTitle libraryLabel={null} isLibraryLabelLoading={false} entrypoint={linkEntrypoint} />);

        expect(screen.getByText('Link attribute error')).toBeInTheDocument();
    });

    test('shows the localized link attribute label for a link entrypoint', () => {
        mockLinkAttributeQuery({
            data: {
                attributes: {
                    list: [{label: {fr: 'Plateformes', en: 'Platforms'}}],
                },
            },
        } as unknown as ReturnType<typeof gqlTypes.useExplorerLinkAttributeQuery>);

        render(<ExplorerTitle libraryLabel={null} isLibraryLabelLoading={false} entrypoint={linkEntrypoint} />);

        expect(screen.getByText('Plateformes')).toBeInTheDocument();
    });
});
