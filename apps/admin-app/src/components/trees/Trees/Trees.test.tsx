// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import {History} from 'history';
import {getTreesQuery} from 'queries/trees/getTreesQuery';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {act, render, screen, waitFor} from '_tests/testUtils';
import {mockTree} from '__mocks__/trees';
import {Mockify} from '../../../_types//Mockify';
import Trees from './Trees';

jest.mock('../TreesList', () => {
    return function TreesList() {
        return <div>TreesList</div>;
    };
});

describe('Trees', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};

        const mocks: MockedResponse[] = [
            {
                request: {
                    query: getTreesQuery,
                    variables: {}
                },
                result: {
                    data: {
                        attributes: {
                            list: [mockTree]
                        }
                    }
                }
            }
        ];

        await act(async () => {
            render(
                <Router>
                    <Trees history={mockHistory as History} />
                </Router>,
                {apolloMocks: mocks}
            );
        });

        expect(await waitFor(() => screen.getByText('TreesList'))).toBeInTheDocument();
    });
});
