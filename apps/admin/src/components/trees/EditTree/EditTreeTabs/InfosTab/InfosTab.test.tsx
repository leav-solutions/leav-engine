// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockTree} from '../../../../../__mocks__/trees';
import InfosTab from './InfosTab';

jest.mock('../../../../../hooks/useLang');

jest.mock('./InfosForm', () => function TreeInfosForm() {
        return <div>TreeInfosForm</div>;
    });

describe('InfosTab', () => {
    test('Snapshot test', async () => {
        await act(async () => {
            render(<InfosTab tree={mockTree} readonly={false} />);
        });

        expect(screen.getByText('TreeInfosForm')).toBeInTheDocument();
    });
});
