import {IConfig} from 'types/types';
import * as config from '../../config/config_spec.json';
import {getConfig} from './../getConfig/getConfig';
import {consume} from './consume/consume';
import {getChannel} from './getChannel/getChannel';
import {initAmqp} from './init/init';
import {startConsume} from './startConsume';

describe('test startConsume', () => {
    test('call other functions', async () => {
        (getChannel as jest.FunctionLike) = jest.fn(() => 'channel');
        (initAmqp as jest.FunctionLike) = jest.fn();
        (consume as jest.FunctionLike) = jest.fn();
        (getConfig as jest.FunctionLike) = jest.fn(() => config);

        await startConsume(config as IConfig);

        expect(getChannel).toBeCalled();
        expect(initAmqp).toBeCalledTimes(2);
        expect(consume).toBeCalledWith('channel', config);
    });
});
