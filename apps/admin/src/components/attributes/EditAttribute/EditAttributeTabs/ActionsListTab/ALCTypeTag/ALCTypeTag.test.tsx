// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render} from 'enzyme';
import ALCTypeTag from './ALCTypeTag';

describe('ALCTypeTag', () => {
    test('Snapshot test', async () => {
        const comp = render(<ALCTypeTag color={[255, 255, 255]} input="ww" />);

        expect(comp).toMatchSnapshot();
    });
});
