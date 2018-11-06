import * as React from 'react';
import {create} from 'react-test-renderer';
import ConfirmedButton from './ConfirmedButton';

describe('ConfirmedButton', () => {
    test('Snapshot test', async () => {
        const action = jest.fn();

        const comp = create(
            <ConfirmedButton action={action} confirmMessage="Test">
                <div />
            </ConfirmedButton>
        );

        expect(comp).toMatchSnapshot();
    });
});
