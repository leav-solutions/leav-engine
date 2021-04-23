// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {PreviewSize} from '../../../../../_types/types';
import CellInfos from './CellInfos';

jest.mock(
    '../CellRecordCard',
    () =>
        function CellRecordCard() {
            return <div>CellRecordCard</div>;
        }
);

jest.mock(
    '../CellSelection',
    () =>
        function CellSelection() {
            return <div>CellSelection</div>;
        }
);

describe('CellInfos', () => {
    test('should contain floating menu', async () => {
        await act(async () => {
            render(
                <MockStore>
                    <CellInfos
                        record={{} as any}
                        previewSize={PreviewSize.small}
                        index="0"
                        selectionData={{id: 'id', library: 'library', label: 'label'}}
                    />
                </MockStore>
            );
        });

        expect(screen.getByTestId('floating-menu')).toBeInTheDocument();
    });
    test('should call CellRecordCard', async () => {
        await act(async () => {
            render(
                <MockStore>
                    <CellInfos
                        record={{} as any}
                        previewSize={PreviewSize.small}
                        index="0"
                        selectionData={{id: 'id', library: 'library', label: 'label'}}
                    />
                </MockStore>
            );
        });

        expect(screen.getByText('CellRecordCard')).toBeInTheDocument();
    });

    test('should call CellSelection', async () => {
        await act(async () => {
            render(
                <MockStore>
                    <CellInfos
                        record={{} as any}
                        previewSize={PreviewSize.small}
                        index="0"
                        selectionData={{id: 'id', library: 'library', label: 'label'}}
                    />
                </MockStore>
            );
        });

        expect(screen.getByText('CellSelection')).toBeInTheDocument();
    });
});
