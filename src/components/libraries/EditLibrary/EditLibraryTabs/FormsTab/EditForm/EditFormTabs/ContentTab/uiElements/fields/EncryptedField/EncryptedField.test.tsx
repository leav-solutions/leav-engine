import {render} from 'enzyme';
import React from 'react';
import EncryptedField from './EncryptedField';

describe('EncryptedField', () => {
    test('Snapshot test', async () => {
        const comp = render(<EncryptedField settings={{}} />);

        expect(comp).toMatchSnapshot();
    });
});
