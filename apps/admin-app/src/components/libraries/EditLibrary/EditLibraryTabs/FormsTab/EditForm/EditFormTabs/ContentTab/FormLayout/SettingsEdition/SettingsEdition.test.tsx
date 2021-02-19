// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {mockInitialState} from '../../formBuilderReducer/_fixtures/fixtures';
import SettingsEdition from './SettingsEdition';

describe('SettingsEdition', () => {
    test('Snapshot test', async () => {
        const comp = render(<SettingsEdition state={mockInitialState} dispatch={jest.fn()} />);

        expect(comp).toMatchSnapshot();
    });
});
