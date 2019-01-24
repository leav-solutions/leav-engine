import {shallow} from 'enzyme';
import * as React from 'react';
import ColumnsDisplay from './ColumnsDisplay';

describe('ColumnsDisplay', () => {
    test('Display columns', async () => {
        const cols = [<div className="col-content" key="1" />, <div className="col-content" key="2" />];

        const comp = shallow(<ColumnsDisplay columnsNumber={4} columnsContent={cols} />);

        expect(comp.find('div.col-content')).toHaveLength(2);
    });

    test.only('Adapt columns width', async () => {
        const cols = [<div className="col-content" key="1" />, <div className="col-content" key="2" />];

        const comp = shallow(<ColumnsDisplay columnsNumber={4} columnsContent={cols} />);

        expect(
            comp
                .find('div.col-content')
                .first()
                .parent()
                .prop('style').width
        ).toBe('25%');
    });
});
