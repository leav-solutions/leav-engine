import * as React from 'react';
import {create} from 'react-test-renderer';
import DeleteLibraryButton from './DeleteLibraryButton';

describe('DeleteLibraryButton', () => {
    test('Snapshot test', async () => {
        const onDelete = jest.fn();
        const comp = create(<DeleteLibraryButton onDelete={onDelete} />);

        expect(comp).toMatchSnapshot();
    });
});
