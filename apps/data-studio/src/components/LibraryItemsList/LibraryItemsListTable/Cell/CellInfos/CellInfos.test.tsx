// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '_tests/testUtils';
import {PreviewSize} from '../../../../../_types/types';
import CellInfos from './CellInfos';

describe('CellInfos', () => {
    test('should contain floating menu', async () => {
        await act(async () => {
            render(
                <CellInfos
                    record={{id: 'recordId', library: {id: 'libraryId'}} as any}
                    previewSize={PreviewSize.small}
                />
            );
        });

        expect(screen.getByTestId('floating-menu')).toBeInTheDocument();
    });
    test('should display record identity ', async () => {
        await act(async () => {
            render(
                <CellInfos
                    record={
                        {id: 'recordId', label: 'my record', library: {id: 'libraryId', label: {fr: 'my lib'}}} as any
                    }
                    previewSize={PreviewSize.small}
                />
            );
        });

        expect(screen.getByText('my record')).toBeInTheDocument();
        expect(screen.getByText('my lib')).toBeInTheDocument();
    });
});
