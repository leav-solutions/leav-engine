import {type MockedResponse} from '@apollo/client/testing';
import {act, render, screen} from '../../../_tests/testUtils';
import {mockLibrary} from '../../../__mocks__/libraries';
import Libraries from './Libraries';
import {GetLibrariesDocument} from '../../../_gqlTypes';

vi.mock('../LibrariesList', () => ({
    default: function LibrariesList() {
        return <div>LibrariesList</div>;
    },
}));

describe('Libraries', () => {
    test('Snapshot test', async () => {
        const mocks: MockedResponse[] = [
            {
                request: {
                    query: GetLibrariesDocument,
                },
                result: {
                    data: {
                        libraries: {
                            totalCount: 1,
                            list: [mockLibrary],
                        },
                    },
                },
            },
        ];

        await act(async () => {
            render(<Libraries />, {apolloMocks: mocks});
        });

        expect(screen.getByText('LibrariesList')).toBeInTheDocument();
    });
});
