// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import ColumnsDisplay from './ColumnsDisplay';

describe('ColumnsDisplay', () => {
    test('Display columns', async () => {
        const cols = [<div className="col-content" key="1" />, <div className="col-content" key="2" />];

        const comp = shallow(<ColumnsDisplay columnsNumber={4} columnsContent={cols} />);

        expect(comp.find('div.col-content')).toHaveLength(2);
    });
});
