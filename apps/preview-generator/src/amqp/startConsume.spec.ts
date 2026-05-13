import {type IConfig} from '../types/types';
import {getConfig} from './../getConfig/getConfig';
import {consume} from './consume/consume';
import {getChannel} from './getChannel/getChannel';
import {initAmqp} from './init/init';
import {startConsume} from './startConsume';

vi.mock('./consume/consume');
vi.mock('./getChannel/getChannel');
vi.mock('./init/init');
vi.mock('../getConfig/getConfig');

describe('test startConsume', () => {
    test('call other functions', async () => {
        const mockconf = {amqp: {hostname: 'localhost'}};

        vi.mocked(getChannel).mockResolvedValue('channel' as any);
        vi.mocked(initAmqp).mockResolvedValue(undefined);
        vi.mocked(consume).mockResolvedValue(undefined);
        vi.mocked(getConfig).mockResolvedValue(mockconf as any);

        await startConsume(mockconf as IConfig);

        expect(getChannel).toBeCalled();
        expect(initAmqp).toBeCalledTimes(2);
        expect(consume).toBeCalledWith('channel', mockconf);
    });
});
