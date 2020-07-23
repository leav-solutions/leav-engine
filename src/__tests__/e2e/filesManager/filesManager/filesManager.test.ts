import {Channel} from 'amqplib';
import {
    copyFileSync,
    existsSync,
    lstatSync,
    mkdirSync,
    readdirSync,
    renameSync,
    rmdirSync,
    unlinkSync,
    writeFileSync
} from 'fs';
import {join} from 'path';
import {IQueryInfos} from '_types/queryInfos';
import {Operator} from '_types/record';
import {getConfig} from '../../../../config';
import {IRecordDomain} from '../../../../domain/record/recordDomain';
import {RoutingKeys} from '../../../../_types/amqp';
import {FileEvents, FilesAttributes, IFileEventData, IPreviewResponse} from '../../../../_types/filesManager';
import {getAmqpChannel, getCoreContainer} from '../globalSetup';

// can't use the rootKey to find library
const library = 'files';

let queueAction: string;
let queueResponse: string;

const routingKeyEvent = RoutingKeys.FILES_EVENT;
const routingKeyResponse = RoutingKeys.FILES_PREVIEW_RESPONSE;

const wait = time => new Promise(r => setTimeout(r, time));

describe('FilesManager', () => {
    const rootPath = '/files';
    const filePath = '.';

    let fileName = 'test.jpg';
    let newFileName = 'newTest.jpg';

    let dirName = 'folder';
    let newDirName = 'newFolder';

    let baseDir: string;
    let workDir: string;

    let baseFile: string;
    let workFile: string;
    let fileInBaseDir: string;
    let fileInWorkDir: string;

    let channel: Channel;

    beforeEach(async () => {
        const conf = await getConfig();

        const rand = Math.random()
            .toString()
            .substring(2);

        fileName = rand + 'F.jpg';
        newFileName = rand + 'F1.jpg';

        dirName = rand + 'D';
        newDirName = rand + 'D1';

        baseDir = join(rootPath, filePath, dirName);
        workDir = join(rootPath, filePath, newDirName);

        baseFile = join(rootPath, filePath, fileName);
        workFile = join(rootPath, filePath, newFileName);
        fileInBaseDir = join(rootPath, filePath, dirName, fileName);
        fileInWorkDir = join(rootPath, filePath, newDirName, fileName);

        // create file for test
        writeFileSync(baseFile, '');

        // create dir for test
        mkdirSync(baseDir);

        const {channel: ch} = await getAmqpChannel();

        channel = ch;

        queueAction = rand + '_test_temp_event';
        queueResponse = rand + '_test_temp_response';

        await channel.assertQueue(queueResponse, {durable: true});
        await channel.assertQueue(queueAction, {durable: true});

        await channel.bindQueue(queueAction, conf.amqp.exchange, routingKeyEvent);
        await channel.bindQueue(queueResponse, conf.amqp.exchange, routingKeyResponse);

        await channel.purgeQueue(conf.filesManager.queues.filesEvents);
        await channel.purgeQueue(conf.filesManager.queues.previewRequest);
        await channel.purgeQueue(conf.filesManager.queues.previewResponse);

        // magic timeout, some test fail without him
        await new Promise(r => setTimeout(r, 100));
    });

    afterEach(async () => {
        // clean what is created in tests
        const filesToDelete = [baseFile, workFile, fileInBaseDir, fileInWorkDir];

        for (const file of filesToDelete) {
            if (existsSync(file)) {
                unlinkSync(file);
            }
        }

        if (existsSync(baseDir)) {
            _deleteFolderRecursive(baseDir);
        }

        if (existsSync(workDir)) {
            _deleteFolderRecursive(workDir);
        }

        await channel.deleteQueue(queueAction);
        await channel.deleteQueue(queueResponse);

        await channel.close();
    });

    test('create file', async done => {
        jest.setTimeout(25000);

        await _consumeResponse(filePath, newFileName, channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, newFileName);

            expect(recordsFind.list).toHaveLength(1);
            expect(recordsFind.list[0]).toEqual(
                expect.objectContaining({
                    [FilesAttributes.IS_DIRECTORY]: false
                })
            );
            expect(existsSync(baseFile)).toBeTruthy();

            done();
        });

        writeFileSync(workFile, '');
    });

    test('create dir', async done => {
        jest.setTimeout(25000);

        await _consumeEvent(filePath, newDirName, FileEvents.CREATE, 'pathAfter', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, newDirName);

            expect(recordsFind.list).toHaveLength(1);
            expect(recordsFind.list[0]).toEqual(
                expect.objectContaining({
                    [FilesAttributes.IS_DIRECTORY]: true
                })
            );

            expect(existsSync(workDir)).toBeTruthy();

            done();
        });

        mkdirSync(workDir);
    });

    test('update file', async done => {
        jest.setTimeout(25000);

        await _consumeEvent(filePath, fileName, FileEvents.UPDATE, 'pathAfter', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName);

            expect(recordsFind.list).toHaveLength(1);

            done();
        });

        await wait(200);

        writeFileSync(baseFile, 'new content');
    });

    test('move in a folder', async done => {
        jest.setTimeout(10000);

        await _consumeEvent(join(filePath, dirName), fileName, FileEvents.MOVE, 'pathAfter', channel, async () => {
            const recordsFind = await _useRecordDomain(join(filePath, dirName), fileName);
            expect(recordsFind.list).toHaveLength(1);

            done();
        });

        await wait(200);
        renameSync(baseFile, fileInBaseDir);
    });

    test('rename file', async done => {
        jest.setTimeout(10000);

        await _consumeEvent(filePath, newFileName, FileEvents.MOVE, 'pathAfter', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, newFileName);
            expect(recordsFind.list).toHaveLength(1);

            done();
        });

        await wait(200);
        renameSync(baseFile, workFile);
    });

    test('overwrite file', async done => {
        jest.setTimeout(10000);

        await _consumeEvent(filePath, fileName, FileEvents.UPDATE, 'pathAfter', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName);
            const overwriteRecordsFind = await _useRecordDomain(filePath, newFileName);

            expect(recordsFind.list).toHaveLength(1);
            expect(overwriteRecordsFind.list).toHaveLength(0);

            done();
        });

        await wait(200);
        writeFileSync(workFile, '');
        renameSync(workFile, baseFile);
    });

    test('move folder with file inside', async done => {
        jest.setTimeout(10000);

        await _consumeEvent(join(filePath, newDirName), fileName, FileEvents.MOVE, 'pathAfter', channel, async () => {
            const recordsFind = await _useRecordDomain(join(filePath, newDirName), fileName);

            expect(recordsFind.list).toHaveLength(1);

            done();
        });

        await wait(200);
        renameSync(baseFile, fileInBaseDir);
        renameSync(baseDir, workDir);
    });

    test('move folder with file inside into other folder', async done => {
        jest.setTimeout(10000);

        await _consumeEvent(
            join(filePath, dirName, newDirName),
            fileName,
            FileEvents.CREATE,
            'pathAfter',
            channel,
            async () => {
                const dirRecordsFind = await _useRecordDomain(join(filePath, dirName), newDirName);
                const fileRecordsFind = await _useRecordDomain(join(filePath, dirName, newDirName), fileName);

                expect(dirRecordsFind.list).toHaveLength(1);
                expect(fileRecordsFind.list).toHaveLength(1);
                expect(existsSync(join(rootPath, filePath, dirName, newDirName))).toBeTruthy();

                done();
            }
        );

        await wait(200);

        mkdirSync(workDir);
        writeFileSync(fileInWorkDir, '');

        renameSync(baseFile, fileInBaseDir);
        renameSync(workDir, `${baseDir}/${newDirName}`);

        await new Promise(r => setTimeout(r, 3000));
    });

    test('remove file', async done => {
        jest.setTimeout(10000);

        await _consumeEvent(filePath, fileName, FileEvents.REMOVE, 'pathBefore', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName);

            expect(recordsFind.list).toHaveLength(0);

            done();
        });

        unlinkSync(baseFile);
    });
});

describe('FilesManager with real files', () => {
    // test file
    const pathToTestsFile = '/app/src/__tests__/e2e/filesManager/filesForTest';
    const rootPath = '/files';
    const filePath = '.';

    let fileName: string;
    let file: string;

    let channel: Channel;

    beforeEach(async done => {
        const conf = await getConfig();

        const rand = Math.random()
            .toString()
            .substring(2);

        fileName = rand + '_test';
        file = join(rootPath, filePath, fileName);

        const {channel: ch} = await getAmqpChannel();

        channel = ch;

        queueAction = rand + '_test_temp_event';
        queueResponse = rand + '_test_temp_response';

        await channel.assertQueue(queueResponse, {durable: true});
        await channel.assertQueue(queueAction, {durable: true});

        await channel.bindQueue(queueAction, conf.amqp.exchange, routingKeyEvent);
        await channel.bindQueue(queueResponse, conf.amqp.exchange, routingKeyResponse);

        await channel.purgeQueue(conf.filesManager.queues.filesEvents);
        await channel.purgeQueue(conf.filesManager.queues.previewRequest);
        await channel.purgeQueue(conf.filesManager.queues.previewResponse);

        done();
    });

    afterEach(async done => {
        // clean what is created in tests
        const extList = ['', '.jpg', '.psd', '.docx', '.eps', '.mp4', '.pdf', '.odp', '.pptx'];
        for (const ext of extList) {
            if (existsSync(file + ext)) {
                unlinkSync(file + ext);
            }
        }

        await channel.deleteQueue(queueAction);
        await channel.deleteQueue(queueResponse);

        await channel.close();
        channel = null;

        done();
    });

    test('create jpg with clipping path', async done => {
        jest.setTimeout(25000);

        await _consumeResponse(filePath, fileName + '.jpg', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName + '.jpg');

            expect(recordsFind.list).toHaveLength(1);
            for (const preview in recordsFind.list[0].previews) {
                if (preview !== 'pages') {
                    expect(recordsFind.list[0].previews_status[preview].status).toEqual(0);
                    expect(recordsFind.list[0].previews[preview]).not.toBe('');
                }
            }
            done();
        });

        const jpgClippingPath = `${pathToTestsFile}/clippingPath.jpg`;
        copyFileSync(jpgClippingPath, `${file}.jpg`);
    });

    test('create jpg with rbg colorspace', async done => {
        jest.setTimeout(25000);

        // sometimes the consume is run multiple times, this flag allow to avoid it
        let alreadyExec = false;

        await _consumeResponse(filePath, fileName + '.jpg', channel, async () => {
            if (!alreadyExec) {
                alreadyExec = true;
                const recordsFind = await _useRecordDomain(filePath, fileName + '.jpg');

                expect(recordsFind.list).toHaveLength(1);
                for (const preview in recordsFind.list[0].previews) {
                    if (preview !== 'pages') {
                        expect(recordsFind.list[0].previews_status[preview].status).toEqual(0);
                        expect(recordsFind.list[0].previews[preview]).not.toBe('');
                    }
                }
            }
            done();
        });

        const jpgRgbColorspace = `${pathToTestsFile}/rgb.jpg`;
        copyFileSync(jpgRgbColorspace, `${file}.jpg`);
    });

    test('create psd with clipping path', async done => {
        jest.setTimeout(35000);
        await _consumeResponse(filePath, fileName + '.psd', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName + '.psd');

            expect(recordsFind.list).toHaveLength(1);
            for (const preview in recordsFind.list[0].previews) {
                if (preview !== 'pages') {
                    expect(recordsFind.list[0].previews_status[preview].status).toEqual(0);
                    expect(recordsFind.list[0].previews[preview]).not.toBe('');
                }
            }

            done();
        });

        const jpgRgbColorspace = `${pathToTestsFile}/clippingPath.psd`;
        copyFileSync(jpgRgbColorspace, `${file}.psd`);
    });

    test('create psd with no clipping path', async done => {
        jest.setTimeout(35000);

        await _consumeResponse(filePath, fileName + '.psd', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName + '.psd');

            expect(recordsFind.list).toHaveLength(1);
            for (const preview in recordsFind.list[0].previews) {
                if (preview !== 'pages') {
                    expect(recordsFind.list[0].previews_status[preview].status).toEqual(0);
                    expect(recordsFind.list[0].previews[preview]).not.toBe('');
                }
            }

            done();
        });

        const jpgRgbColorspace = `${pathToTestsFile}/noClippingPath.psd`;
        copyFileSync(jpgRgbColorspace, `${file}.psd`);
    });

    test('create pdf with pages', async done => {
        jest.setTimeout(35000);

        await _consumeResponse(filePath, fileName + '.pdf', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName + '.pdf');

            expect(recordsFind.list).toHaveLength(1);
            for (const preview in recordsFind.list[0].previews) {
                if (recordsFind.list[0].previews[preview]) {
                    expect(recordsFind.list[0].previews_status[preview].status).toEqual(0);
                    expect(recordsFind.list[0].previews[preview]).not.toBe('');
                }
            }

            done();
        });

        const jpgRgbColorspace = `${pathToTestsFile}/multiPages.pdf`;
        copyFileSync(jpgRgbColorspace, `${file}.pdf`);
    });

    test('create odp', async done => {
        jest.setTimeout(35000);

        await _consumeResponse(filePath, fileName + '.odp', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName + '.odp');

            expect(recordsFind.list).toHaveLength(1);
            for (const preview in recordsFind.list[0].previews) {
                if (recordsFind.list[0].previews[preview]) {
                    expect(recordsFind.list[0].previews_status[preview].status).toEqual(0);
                    expect(recordsFind.list[0].previews[preview]).not.toBe('');
                }
            }

            done();
        });

        const jpgRgbColorspace = `${pathToTestsFile}/odp.odp`;
        copyFileSync(jpgRgbColorspace, `${file}.odp`);
    });

    test('create pptx', async done => {
        jest.setTimeout(35000);

        await _consumeResponse(filePath, fileName + '.pptx', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName + '.pptx');

            expect(recordsFind.list).toHaveLength(1);
            for (const preview in recordsFind.list[0].previews) {
                if (recordsFind.list[0].previews[preview]) {
                    expect(recordsFind.list[0].previews_status[preview].status).toEqual(0);
                    expect(recordsFind.list[0].previews[preview]).not.toBe('');
                }
            }

            done();
        });

        const jpgRgbColorspace = `${pathToTestsFile}/pptx.pptx`;
        copyFileSync(jpgRgbColorspace, `${file}.pptx`);
    });

    test('create docx', async done => {
        jest.setTimeout(35000);

        await _consumeResponse(filePath, fileName + '.docx', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName + '.docx');

            expect(recordsFind.list).toHaveLength(1);
            for (const preview in recordsFind.list[0].previews) {
                if (recordsFind.list[0].previews[preview]) {
                    expect(recordsFind.list[0].previews_status[preview].status).toEqual(0);
                    expect(recordsFind.list[0].previews[preview]).not.toBe('');
                }
            }

            done();
        });

        const jpgRgbColorspace = `${pathToTestsFile}/docx.docx`;
        copyFileSync(jpgRgbColorspace, `${file}.docx`);
    });

    test('create mp4 video', async done => {
        jest.setTimeout(35000);

        await _consumeResponse(filePath, fileName + '.mp4', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName + '.mp4');

            expect(recordsFind.list).toHaveLength(1);
            for (const preview in recordsFind.list[0].previews) {
                if (preview !== 'pages') {
                    expect(recordsFind.list[0].previews_status[preview].status).toEqual(0);
                    expect(recordsFind.list[0].previews[preview]).not.toBe('');
                }
            }

            done();
        });

        const jpgRgbColorspace = `${pathToTestsFile}/mp4.mp4`;
        copyFileSync(jpgRgbColorspace, `${file}.mp4`);
    });

    test('create eps', async done => {
        jest.setTimeout(35000);

        await _consumeResponse(filePath, fileName + '.eps', channel, async () => {
            const recordsFind = await _useRecordDomain(filePath, fileName + '.eps');

            expect(recordsFind.list).toHaveLength(1);
            for (const preview in recordsFind.list[0].previews) {
                if (preview !== 'pages') {
                    expect(recordsFind.list[0].previews_status[preview].status).toEqual(0);
                    expect(recordsFind.list[0].previews[preview]).not.toBe('');
                }
            }

            done();
        });

        const jpgRgbColorspace = `${pathToTestsFile}/eps.eps`;
        copyFileSync(jpgRgbColorspace, `${file}.eps`);
    });
});

const _useRecordDomain = async (path: string, name: string) => {
    const coreContainer = await getCoreContainer();

    const recordDomain: IRecordDomain = coreContainer.cradle['core.domain.record'];
    const ctx: IQueryInfos = {
        userId: '0',
        queryId: 'fileManagerE2eTest'
    };

    const recordsFind = await recordDomain.find({
        params: {
            library,
            filters: [
                {field: FilesAttributes.FILE_PATH, value: path},
                {operator: Operator.AND},
                {field: FilesAttributes.FILE_NAME, value: name}
            ]
        },
        ctx
    });
    return recordsFind;
};

const _deleteFolderRecursive = (path: string) => {
    if (existsSync(path)) {
        readdirSync(path).forEach(file => {
            const curPath = path + '/' + file;
            if (lstatSync(curPath).isDirectory()) {
                // recursive
                _deleteFolderRecursive(curPath);
            } else {
                // delete file
                unlinkSync(curPath);
            }
        });
        rmdirSync(path);
    }
};

const _consumeEvent = async (
    filePath: string,
    fileName: string,
    event: string,
    pathToUse: 'pathBefore' | 'pathAfter',
    channel: Channel,
    func: (msg: IFileEventData) => Promise<void>
) => {
    // handle only one message at the time
    channel.prefetch(1);

    channel.consume(queueAction, async msg => {
        if (msg) {
            channel.ack(msg);
            const msgBody: IFileEventData = JSON.parse(msg.content.toString());
            if (msgBody.event === event && msgBody[pathToUse] === join(filePath, fileName)) {
                // wait for the core to handle the message
                await new Promise(r => setTimeout(r, 500));

                await func(msgBody);
            }
        }
    });
};

const _consumeResponse = async (
    filePath: string,
    fileName: string,
    channel: Channel,
    func: (channel: Channel, msg: IPreviewResponse) => Promise<void>
) => {
    // handle only one message at the time
    channel.prefetch(1);

    channel.consume(queueResponse, async msg => {
        if (msg) {
            channel.ack(msg);
            const msgBody: IPreviewResponse = JSON.parse(msg.content.toString());

            if (msgBody.input === join(filePath, fileName)) {
                // wait for the core to handle the response
                await new Promise(r => setTimeout(r, 100));

                await func(channel, msgBody);
            }
        }
    });
};
