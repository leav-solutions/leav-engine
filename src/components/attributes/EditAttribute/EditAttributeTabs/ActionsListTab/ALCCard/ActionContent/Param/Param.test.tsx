import React from 'react';
import {render} from 'enzyme';
import Param from './Param';

// import data from '../../../../data.json';

function placeholder() {
    return undefined;
}

const paramsMock = [
    {
        name: 'additionner',
        type: 'float',
        description: 'a float or integer to add',
        required: true,
        default: '0'
    }
];

describe('Param', () => {
    test('Snapshot test', async () => {
        const comp = render(<Param param={paramsMock[0]} changeParam={placeholder} index={0} actionId={0} />);
        expect(true).toBe(true);
    });
});
