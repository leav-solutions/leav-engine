// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import ALCListSelector from './ALCListSelector';

describe('ALCListSelector', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <ALCListSelector changeSelectorTo={jest.fn()} currentActionListName="test" connectionFailures={[]} />
        );

        expect(comp).toMatchSnapshot();
    });
});
