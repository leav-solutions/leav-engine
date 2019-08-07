import {MockedProvider} from '@apollo/react-testing';
import React from 'react';
import {act, create} from 'react-test-renderer';
import AttributesSelectionModal from './AttributesSelectionModal';

describe('AttributesSelection', () => {
    test('Snapshot test', async () => {
        const onSubmit = jest.fn();
        const onClose = jest.fn();
        const selection = [];

        let comp;
        comp = create(
            <MockedProvider>
                <AttributesSelectionModal onSubmit={onSubmit} onClose={onClose} openModal selection={selection} />
            </MockedProvider>
        );

        act(() => {
            comp.update();
        });

        expect(comp).toMatchSnapshot();
    });
});
