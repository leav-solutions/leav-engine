// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PreviewSize} from '_ui/constants';
import {render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import CellInfos from './CellInfos';

describe('CellInfos', () => {
    test('should contain floating menu', async () => {
        render(
            <MockSearchContextProvider>
                <CellInfos
                    record={{id: 'recordId', library: {id: 'libraryId'}} as any}
                    previewSize={PreviewSize.small}
                    onEdit={() => null}
                />
            </MockSearchContextProvider>
        );

        expect(screen.getByTestId('floating-menu')).toBeInTheDocument();
    });

    test('should display record identity ', async () => {
        render(
            <MockSearchContextProvider>
                <CellInfos
                    record={
                        {id: 'recordId', label: 'my record', library: {id: 'libraryId', label: {fr: 'my lib'}}} as any
                    }
                    previewSize={PreviewSize.small}
                    onEdit={() => null}
                />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('my record')).toBeInTheDocument();
        expect(screen.getByText('my lib')).toBeInTheDocument();
    });
});
