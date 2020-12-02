// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import EncryptedField from './EncryptedField';

describe('EncryptedField', () => {
    test('Snapshot test', async () => {
        const comp = render(<EncryptedField settings={{}} />);

        expect(comp).toMatchSnapshot();
    });
});
