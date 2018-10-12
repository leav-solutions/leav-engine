import * as React from 'react';
import {create} from 'react-test-renderer';
import DeleteButton from './DeleteButton';

describe('DeleteButton', () => {
    test('Snapshot test', async () => {
        const onDelete = jest.fn();
        const comp = create(<DeleteButton onDelete={onDelete} />);

        expect(comp).toMatchSnapshot();
    });
});
