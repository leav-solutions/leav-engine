import userEvent from '@testing-library/user-event';
import {render, screen, waitFor} from '../../../_tests/testUtils';
import {mockVersionProfile} from '../../../__mocks__/common/versionProfiles';
import VersionProfiles from './VersionProfiles';
import {DeleteVersionProfileDocument, GetVersionProfilesDocument} from '../../../_gqlTypes';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('VersionProfiles', () => {
    const mocks = [
        {
            request: {
                query: GetVersionProfilesDocument,
                variables: {filters: {}},
            },
            result: {
                data: {
                    versionProfiles: {
                        list: [
                            {...mockVersionProfile, id: 'vpA'},
                            {...mockVersionProfile, id: 'vpB'},
                        ],
                    },
                },
            },
        },
        {
            request: {
                query: GetVersionProfilesDocument,
                variables: {filters: {id: '%B%'}},
            },
            result: {
                data: {
                    versionProfiles: {
                        list: [{...mockVersionProfile, id: 'vpB'}],
                    },
                },
            },
        },
    ];
    test('Render test', async () => {
        render(<VersionProfiles />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText('vpA')).toBeInTheDocument();
        expect(await screen.findByText('vpB')).toBeInTheDocument();

        // Filter list
        await userEvent.type(screen.getByRole('textbox', {name: /id/}), 'B');

        expect(await screen.findByText('vpB')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('vpA')).not.toBeInTheDocument());

        await userEvent.click(screen.getByText('vpB'));
        expect(mockNavigate).toHaveBeenCalledWith('/version_profiles/edit/vpB');
    });

    test('Can delete a profile', async () => {
        let deleteCalled = false;
        const mocksWithDelete = [
            ...mocks,
            {
                request: {
                    query: DeleteVersionProfileDocument,
                    variables: {id: 'vpA'},
                },
                result: () => {
                    deleteCalled = true;
                    return {
                        data: {
                            deleteVersionProfile: {
                                id: 'vpA',
                            },
                        },
                    };
                },
            },
        ];

        render(<VersionProfiles />, {apolloMocks: mocksWithDelete});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        await userEvent.click((await screen.findAllByRole('button', {name: /delete/}))[0]);
        await userEvent.click(await screen.findByText('OK'));

        await waitFor(() => expect(deleteCalled).toBe(true));
    });
});
