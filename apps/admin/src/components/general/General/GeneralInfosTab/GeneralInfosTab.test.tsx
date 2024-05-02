// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getCoreVersionQuery} from 'queries/version/getVersionQuery';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import GeneralInfosTab from './GeneralInfosTab';

jest.mock('components/general/PluginsExplorer', () => function PluginsExplorer() {
        return <div>PluginsExplorer</div>;
    });

describe('GeneralInfosTab', () => {
    test('Render test', async () => {
        const mocks = [
            {
                request: {
                    query: getCoreVersionQuery,
                    variables: {}
                },
                result: {
                    data: {
                        version: '42.0.0'
                    }
                }
            }
        ];
        await act(async () => {
            render(<GeneralInfosTab />, {apolloMocks: mocks});
        });

        expect(await screen.findByText(/42.0.0/)).toBeInTheDocument();
        expect(screen.getByText('PluginsExplorer')).toBeInTheDocument();
    });
});
