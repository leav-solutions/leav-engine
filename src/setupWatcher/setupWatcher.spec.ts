import {start} from '../watch/watch';
import {startWatch, getConfig} from './setupWatcher';
import {connect} from 'amqplib';

describe('test init', () => {
    console.info = jest.fn();
    const path = '/Users/smarzykmathieu/Dev/automate-scan/config/config.integration.test.json';
    test('startWatch', async () => {
        // block use of rabbitmq
        (connect as jest.FunctionLike) = jest.fn();
        (start as jest.FunctionLike) = jest.fn();

        await startWatch(path);

        expect(start).toBeCalled();
    });
});
