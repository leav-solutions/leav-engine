import {render} from 'enzyme';
import React from 'react';
import {initialState} from '../../formBuilderReducer/_fixtures/fixtures';
import SettingsEdition from './SettingsEdition';

describe('SettingsEdition', () => {
    test('Snapshot test', async () => {
        const comp = render(<SettingsEdition state={initialState} dispatch={jest.fn()} />);

        expect(comp).toMatchSnapshot();
    });
});
