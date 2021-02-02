// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from 'types/types';
import {getConfig} from './../getConfig/getConfig';
import {consume} from './consume/consume';
import {getChannel} from './getChannel/getChannel';
import {initAmqp} from './init/init';
import {startConsume} from './startConsume';

describe('test startConsume', () => {
    test('call other functions', async () => {
        const mockconf = {amqp: {hostname: 'localhost'}};

        (getChannel as jest.FunctionLike) = jest.fn(() => 'channel');
        (initAmqp as jest.FunctionLike) = jest.fn();
        (consume as jest.FunctionLike) = jest.fn();
        (getConfig as jest.FunctionLike) = jest.fn(() => mockconf);

        await startConsume(mockconf as IConfig);

        expect(getChannel).toBeCalled();
        expect(initAmqp).toBeCalledTimes(2);
        expect(consume).toBeCalledWith('channel', mockconf);
    });
});
