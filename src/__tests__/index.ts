import * as amqp from 'amqplib';
import * as rmq from '../rmq';
import {RMQConn} from '../_types/rmq';
import {Config} from '../_types/config';
import {FullTreeContent} from '../_types/queries';
import {FilesystemContent} from '../_types/filesystem';
import config from '../config';
import * as scan from '../scan';

let fsScan: FilesystemContent;
let dbScan: FullTreeContent;

beforeAll(async () => {
    const conf: Config = await config;

    // RabbitMQ initialization
    const connOpt: amqp.Options.Connect = conf.rmq.connOpt;
    const {exchange, queue, routingKey, type} = conf.rmq;
    const rmqConn: RMQConn = await rmq.init(connOpt, exchange, queue, routingKey, type);

    fsScan = await scan.filesystem();
    dbScan = await scan.database();

    // await automate(fsScan, dbScan, rmqConn.channel);
});

describe('integration tests sync-scan', () => {
    test('scan empty filesystem', () => {
        expect(fsScan).toEqual(expect.arrayContaining([]));
    });

    test('scan empty database', () => {
        expect(fsScan).toEqual(expect.arrayContaining([]));
    });

    // test('file/directory creation', () => {
    //     const pathTmpFile = `${conf.filesystem.absolutePath}/file_${Math.random()}`;
    //     fs.writeFileSync(pathTmpFile, Math.random());
    // });

    // test('file/directory move', () => {
    //     console.log('test');
    // });

    // test('file/directory delete', () => {
    //     console.log('test');
    // });
});

// import * as amqp from 'amqplib/callback_api';
// import {Channel} from 'amqplib';
// import * as fs from 'fs';

// describe('integration test automate-scan', () => {
//     console.info = jest.fn();

//     const path = '/Users/smarzykmathieu/Dev/automate-scan/config/config.integration.test.json';
//     const queue = 'test';
//     const exchange = 'test';

//     test('create a file and check if event send to rabbitmq', async done => {
//         // set max timeout in jest test
//         jest.setTimeout(10000);

//         const pathTmpFile = './folder_to_watch/file_' + Math.random();
//         const watcher = await startWatch(path);

//         // Need the watcher to work
//         expect(watcher).toBeDefined();

//         // Wait for the init to finish
//         watcher.on('ready', () => {
//             fs.writeFileSync(pathTmpFile, Math.random());
//         });

//         await initRabbitMQ(queue, (channel: Channel, msg: string) => {
//             watcher.close();
//             // Get the message consume

//             // Delete the file create for the test
//             fs.unlinkSync(pathTmpFile);

//             // Test if the message is correct
//             expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('create'));

//             done();
//         });
//     });

//     test('update a file and check if event send to rabbitmq', async done => {
//         // set max timeout in jest test
//         jest.setTimeout(15000);
//         const pathTmpFile = './folder_to_watch/file_' + Math.random();

//         fs.writeFileSync(pathTmpFile, Math.random());

//         const watcher = await startWatch(path);
//         // Need the watcher to work
//         expect(watcher).toBeDefined();

//         // Wait for the init to finish
//         watcher.on('ready', () => {
//             fs.writeFileSync(pathTmpFile, Math.random());
//         });

//         await initRabbitMQ(queue, (channel: Channel, msg: string) => {
//             watcher.close();

//             expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('update'));
//             fs.unlinkSync(pathTmpFile);

//             done();
//         });
//     });

//     test('delete a file and check if event send to rabbitmq', async done => {
//         // set max timeout in jest test
//         jest.setTimeout(15000);
//         const pathTmpFile = './folder_to_watch/file_' + Math.random();

//         fs.writeFileSync(pathTmpFile, Math.random());

//         const watcher = await startWatch(path);
//         // Need the watcher to work
//         expect(watcher).toBeDefined();

//         // Wait for the init to finish
//         watcher.on('ready', () => {
//             if (fs.existsSync(pathTmpFile)) {
//                 fs.unlinkSync(pathTmpFile);
//             }
//         });

//         await initRabbitMQ(queue, (channel: Channel, msg: string) => {
//             watcher.close();

//             expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('delete'));

//             done();
//         });
//     });

//     test('rename a file and check if event send to rabbitmq', async done => {
//         // set max timeout in jest test
//         jest.setTimeout(15000);

//         const pathTmpFile = './folder_to_watch/file1_' + Math.random();
//         const newPathTmpFile = './folder_to_watch/file2_' + Math.random();

//         fs.writeFileSync(pathTmpFile, Math.random());

//         const watcher = await startWatch(path);
//         // Need the watcher to work
//         expect(watcher).toBeDefined();

//         // Wait for the init to finish
//         watcher.on('ready', () => {
//             if (fs.existsSync(pathTmpFile)) {
//                 fs.renameSync(pathTmpFile, newPathTmpFile);
//             }
//         });

//         await initRabbitMQ(queue, (channel: Channel, msg: string) => {
//             watcher.close();

//             expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('move'));
//             fs.unlinkSync(newPathTmpFile);

//             done();
//         });
//     });

//     test('move a file and check if event send to rabbitmq', async done => {
//         // set max timeout in jest test
//         jest.setTimeout(15000);

//         const fileName = 'file_' + Math.random();
//         const pathTmpFile = './folder_to_watch/' + fileName;
//         const newPathTmpFile = './folder_to_watch/1/' + fileName;

//         fs.writeFileSync(pathTmpFile, Math.random());

//         const watcher = await startWatch(path);
//         // Need the watcher to work
//         expect(watcher).toBeDefined();

//         // Wait for the init to finish
//         watcher.on('ready', () => {
//             if (fs.existsSync(pathTmpFile)) {
//                 fs.renameSync(pathTmpFile, newPathTmpFile);
//             }
//         });

//         await initRabbitMQ(queue, (channel: Channel, msg: string) => {
//             watcher.close();

//             expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('move'));
//             fs.unlinkSync(newPathTmpFile);

//             done();
//         });
//     });

//     test('move and rename a file and check if event send to rabbitmq', async done => {
//         // set max timeout in jest test
//         jest.setTimeout(15000);
//         const pathTmpFile = './folder_to_watch/file1_' + Math.random();
//         const newPathTmpFile = './folder_to_watch/1/file2_' + Math.random();

//         fs.writeFileSync(pathTmpFile, Math.random());

//         const watcher = await startWatch(path);
//         // Need the watcher to work
//         expect(watcher).toBeDefined();

//         // Wait for the init to finish
//         watcher.on('ready', () => {
//             if (fs.existsSync(pathTmpFile)) {
//                 fs.renameSync(pathTmpFile, newPathTmpFile);
//             }
//         });

//         initRabbitMQ(queue, (channel: Channel, msg: string) => {
//             watcher.close();

//             expect(msg).toEqual(expect.stringContaining('file') && expect.stringContaining('move'));

//             fs.unlinkSync(newPathTmpFile);

//             channel.deleteQueue(queue);
//             channel.deleteExchange(exchange);

//             done();
//         });
//     });
// });

// const initRabbitMQ = async (queue: string, callback: (channel: any, msg: string) => void) => {
//     amqp.connect('amqp://localhost', async (error0, connection) => {
//         if (error0) {
//             throw error0;
//         }

//         connection.createChannel(async (error1, channel) => {
//             if (error1) {
//                 throw error1;
//             }

//             channel.consume(
//                 queue,
//                 msg => {
//                     const msgText = msg.content.toString();
//                     callback(channel, msgText);
//                     channel.close(() => undefined);
//                 },
//                 {noAck: true}
//             );
//         });
//     });
// };
