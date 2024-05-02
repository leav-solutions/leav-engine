// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import {History} from 'history';
import {getLibsQuery} from 'queries/libraries/getLibrariesQuery';
import {BrowserRouter as Router} from 'react-router-dom-v5';
import {act, render, screen} from '_tests/testUtils';
import {mockLibrary} from '__mocks__/libraries';
import {Mockify} from '../../../_types//Mockify';
import Libraries from './Libraries';

jest.mock('../LibrariesList', () => function LibrariesList() {
        return <div>LibrariesList</div>;
    });
describe('Libraries', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};

        const mocks: MockedResponse[] = [
            {
                request: {
                    query: getLibsQuery
                },
                result: {
                    data: {
                        attributes: {
                            list: [mockLibrary]
                        }
                    }
                }
            }
        ];

        await act(async () => {
            render(
                <Router>
                    <Libraries history={mockHistory as History} />
                </Router>,
                {apolloMocks: mocks}
            );
        });

        expect(screen.getByText('LibrariesList')).toBeInTheDocument();
    });
});
