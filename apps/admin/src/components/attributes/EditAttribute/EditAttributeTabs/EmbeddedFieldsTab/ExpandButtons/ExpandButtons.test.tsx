// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import ExpandButtons from './ExpandButtons';

describe('EmbeddedFieldsWrapper', () => {
    test('should display two Button', async () => {
        const comp = render(<ExpandButtons flatItems={[]} setFlatItems={jest.fn} />);

        expect(comp.find('button')).toHaveLength(2);
    });
});
