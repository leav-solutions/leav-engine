import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {create} from 'react-test-renderer';
import AttributesSelectionModal from './AttributesSelectionModal';

describe('AttributesSelection', () => {
    test('Snapshot test', async () => {
        const onSubmit = jest.fn();
        const onClose = jest.fn();
        const selection = [];
        const comp = create(
            <MockedProvider>
                <AttributesSelectionModal onSubmit={onSubmit} onClose={onClose} openModal selection={selection} />
            </MockedProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
