// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType} from '../../../../_types/types';
import Header from './Header';

describe('Header', () => {
    test('should display value', async () => {
        let comp: any;

        const value = 'value';

        await act(async () => {
            comp = mount(
                <Header name={'name'} type={AttributeType.simple}>
                    {value}
                </Header>
            );
        });

        expect(comp.text()).toContain(value);
    });
});
