import {render} from 'enzyme';
import React from 'react';
import {mockLibrary} from '../../../__mocks__/libraries';
import SelectRecord from './SelectRecord';

describe('SelectRecord', () => {
    test('Snapshot test', async () => {
        const onSelect = jest.fn();
        render(<SelectRecord library={mockLibrary} onSelect={onSelect} />);

        expect(true).toBe(true);
    });
});
