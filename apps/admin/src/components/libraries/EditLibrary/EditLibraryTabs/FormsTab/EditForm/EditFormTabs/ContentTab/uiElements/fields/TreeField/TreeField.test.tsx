// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import TreeField from './TreeField';
import MockedLangContextProvider from '__mocks__/MockedLangContextProvider';

describe('TreeField', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedLangContextProvider>
                <TreeField settings={{}} />
            </MockedLangContextProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
