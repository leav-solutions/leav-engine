// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockTree} from '../../../../../__mocks__/trees';
import PermissionsTab from './PermissionsTab';

jest.mock('./PermissionsContent', () => function PermissionsContent() {
        return <div>PermissionsContent</div>;
    });

describe('PermissionsTab', () => {
    test('Snapshot test', async () => {
        await act(async () => {
            render(<PermissionsTab tree={{...mockTree}} readonly={false} />);
        });

        expect(screen.getByText('PermissionsContent')).toBeInTheDocument();
    });
});
