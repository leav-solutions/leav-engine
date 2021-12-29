// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Channel} from 'amqplib';
import * as amqp from 'amqplib/callback_api';
import * as fs from 'fs';
import {startWatch} from '../../setupWatcher/setupWatcher';
import {getConfig} from '../../';

describe('integration test automate-scan', () => {
    console.info = jest.fn();

    test('create a file and check if event send to rabbitmq', async done => {
        const config = await getConfig();

        // set max timeout in jest test
        jest.setTimeout(10000);

        const pathTmpFile = config.rootPath + '/file_' + Math.random();
        const watcher = await startWatch();

        // Need the watcher to work
        expect(watcher).toBeDefined();

        // Wait for the init to finish
        watcher.on('ready', () => {
            fs.writeFileSync(pathTmpFile, Math.random());
        });

        await initRabbitMQ((channel: Channel, msg: string) => {
            watcher.close();
            // Get the message consume

            // Delete the file create for the test
            fs.unlinkSync(pathTmpFile);

            // Test if the message is correct
            expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('CREATE'));

            done();
        });
    });

    test('update a file and check if event send to rabbitmq', async done => {
        const config = await getConfig();

        // set max timeout in jest test
        jest.setTimeout(15000);
        const pathTmpFile = config.rootPath + '/file_' + Math.random();

        fs.writeFileSync(pathTmpFile, Math.random());

        const watcher = await startWatch();
        // Need the watcher to work
        expect(watcher).toBeDefined();

        // Wait for the init to finish
        watcher.on('ready', () => {
            fs.writeFileSync(pathTmpFile, Math.random());
        });

        await initRabbitMQ((channel: Channel, msg: string) => {
            watcher.close();

            expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('UPDATE'));
            fs.unlinkSync(pathTmpFile);

            done();
        });
    });

    test('delete a file and check if event send to rabbitmq', async done => {
        const config = await getConfig();

        // set max timeout in jest test
        jest.setTimeout(15000);
        const pathTmpFile = config.rootPath + '/file_' + Math.random();

        fs.writeFileSync(pathTmpFile, Math.random());

        const watcher = await startWatch();
        // Need the watcher to work
        expect(watcher).toBeDefined();

        // Wait for the init to finish
        watcher.on('ready', () => {
            if (fs.existsSync(pathTmpFile)) {
                fs.unlinkSync(pathTmpFile);
            }
        });

        await initRabbitMQ((channel: Channel, msg: string) => {
            watcher.close();

            expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('REMOVE'));

            done();
        });
    });

    test('rename a file and check if event send to rabbitmq', async done => {
        const config = await getConfig();

        // set max timeout in jest test
        jest.setTimeout(15000);

        const pathTmpFile = config.rootPath + '/file1_' + Math.random();
        const newPathTmpFile = config.rootPath + '/file2_' + Math.random();

        fs.writeFileSync(pathTmpFile, Math.random());

        const watcher = await startWatch();
        // Need the watcher to work
        expect(watcher).toBeDefined();

        // Wait for the init to finish
        watcher.on('ready', () => {
            if (fs.existsSync(pathTmpFile)) {
                fs.renameSync(pathTmpFile, newPathTmpFile);
            }
        });

        await initRabbitMQ((channel: Channel, msg: string) => {
            watcher.close();

            expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('MOVE'));
            fs.unlinkSync(newPathTmpFile);

            done();
        });
    });

    test('move a file and check if event send to rabbitmq', async done => {
        const config = await getConfig();

        // set max timeout in jest test
        jest.setTimeout(15000);

        const fileName = 'file_' + Math.random();
        const pathTmpFile = config.rootPath + '/' + fileName;
        const newPathTmpFile = config.rootPath + '/1/' + fileName;

        fs.writeFileSync(pathTmpFile, Math.random());

        const watcher = await startWatch();
        // Need the watcher to work
        expect(watcher).toBeDefined();

        // Wait for the init to finish
        watcher.on('ready', () => {
            if (fs.existsSync(pathTmpFile)) {
                fs.renameSync(pathTmpFile, newPathTmpFile);
            }
        });

        await initRabbitMQ((channel: Channel, msg: string) => {
            watcher.close();

            expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('MOVE'));
            fs.unlinkSync(newPathTmpFile);

            done();
        });
    });

    test('move and rename a file and check if event send to rabbitmq', async done => {
        const config = await getConfig();

        // set max timeout in jest test
        jest.setTimeout(15000);
        const pathTmpFile = config.rootPath + '/file1_' + Math.random();
        const newPathTmpFile = config.rootPath + '/1/file2_' + Math.random();

        fs.writeFileSync(pathTmpFile, Math.random());

        const watcher = await startWatch();
        // Need the watcher to work
        expect(watcher).toBeDefined();

        // Wait for the init to finish
        watcher.on('ready', () => {
            if (fs.existsSync(pathTmpFile)) {
                fs.renameSync(pathTmpFile, newPathTmpFile);
            }
        });

        await initRabbitMQ((channel: Channel, msg: string) => {
            watcher.close();

            expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('MOVE'));

            fs.unlinkSync(newPathTmpFile);

            done();
        });
    });
});

const initRabbitMQ = async (callback: (channel: any, msg: string) => void) => {
    const config = await getConfig();

    const amqpConfig = {
        protocol: config.amqp.protocol,
        hostname: config.amqp.hostname,
        username: config.amqp.username,
        password: config.amqp.password
    };

    amqp.connect(amqpConfig, async (error0, connection) => {
        if (error0) {
            throw error0;
        }

        connection.createChannel(async (error1, channel) => {
            if (error1) {
                throw error1;
            }

            channel.consume(
                config.amqp.queue,
                msg => {
                    const msgText = msg.content.toString();
                    callback(channel, msgText);
                    channel.close(() => undefined);
                },
                {noAck: true}
            );
        });
    });
};
