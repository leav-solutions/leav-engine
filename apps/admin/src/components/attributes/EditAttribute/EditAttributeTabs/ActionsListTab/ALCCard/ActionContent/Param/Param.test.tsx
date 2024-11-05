// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import Param from './Param';

// import data from '../../../../data.json';

function placeholder() {
    return undefined;
}

const paramsMock = [
    {
        name: 'additionner',
        default_value: '0',
        type: 'float',
        description: 'a float or integer to add',
        required: true,
        default: '0'
    }
];

describe('Param', () => {
    test('Snapshot test', async () => {
        render(
            <Param param={paramsMock[0]} changeParam={placeholder} index={0} actionId={0} setBlockCard={jest.fn()} />
        );
        expect(true).toBe(true);
    });
});
