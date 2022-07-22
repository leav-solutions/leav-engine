// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as fs from 'fs';
import {join} from 'path';
import {FilesAttributes} from '../../../../_types/filesManager';
import {IRecord, Operator} from '../../../../_types/record';
import {makeGraphQlCall} from '../../api/e2eUtils';

jest.setTimeout(30000);

const library = 'files';

const rand = Math.random()
    .toString()
    .substring(2);

const _fileExists = async (path: string) => !!(await fs.promises.stat(path).catch(e => false));

const _findFileFromGraphql = async (
    filepath: string,
    filename: string,
    additionalFields?: string[]
): Promise<IRecord[]> => {
    try {
        const res = await makeGraphQlCall(`{
            ${library}(filters: [
                {
                    field: "${FilesAttributes.FILE_PATH}",
                    condition: EQUAL,
                    value: "${filepath}"
                },
                {operator: ${Operator.AND}},
                {
                    field: "${FilesAttributes.FILE_NAME}",
                    condition: EQUAL,
                    value: "${filename}"
                }
            ]) {
                list {
                    id ${additionalFields.join(' ')}
                }
            }
        }`);

        if (res?.data?.errors) {
            console.error(res.data.errors);
        }

        return res?.data?.data?.[library]?.list ?? [];
    } catch (err) {
        console.error(err);
        return [];
    }
};

describe('Files manager', () => {
    const rootPath = '/files';
    const filePath = '.';
    const pathToTestsFile = '/app/src/__tests__/e2e/filesManager/filesForTest';

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

    let file: string;

    describe('FilesManager with real files', () => {
        beforeEach(async () => {
            fileName = rand + 'F';
            newFileName = rand + 'F1';

            dirName = rand + 'D';
            newDirName = rand + 'D1';

            baseDir = join(rootPath, filePath, dirName);
            workDir = join(rootPath, filePath, newDirName);

            baseFile = join(rootPath, filePath, fileName);
            workFile = join(rootPath, filePath, newFileName);
            fileInBaseDir = join(rootPath, filePath, dirName, fileName);
            fileInWorkDir = join(rootPath, filePath, newDirName, fileName);

            // Create baseDir if not exists
            if (!(await _fileExists(rootPath))) {
                await fs.promises.mkdir(rootPath, {recursive: true});
            }

            // create file for test
            await fs.promises.writeFile(baseFile, '');

            // create dir for test
            await fs.promises.mkdir(baseDir);
        });

        afterEach(async () => {
            // clean what is created in tests
            console.log('GO CLEAN');
            const filesToDelete = [baseFile, workFile, fileInBaseDir, fileInWorkDir];
            for (const f of filesToDelete) {
                if (await _fileExists(f)) {
                    await fs.promises.unlink(f);
                }
            }
            if (await _fileExists(baseDir)) {
                await _deleteFolderRecursive(baseDir);
            }
            if (await _fileExists(workDir)) {
                await _deleteFolderRecursive(workDir);
            }
        });

        test.only('create file', async done => {
            console.log('CALL CREATE FILE');
            expect.assertions(3);

            await fs.promises.writeFile(workFile, '');

            await setTimeout(async () => {
                const files = await _findFileFromGraphql(filePath, newFileName, [FilesAttributes.IS_DIRECTORY]);

                expect(files.length).toBe(1);
                expect(files[0]).toEqual(
                    expect.objectContaining({
                        [FilesAttributes.IS_DIRECTORY]: false
                    })
                );

                expect(await _fileExists(baseFile)).toBeTruthy();
                done();
            }, 1500);
            console.log('end CREATE FILE');
        });

        test.only('create dir', async done => {
            console.log('CALL CREATE dir');
            expect.assertions(3);
            await fs.promises.mkdir(workDir);

            await setTimeout(async () => {
                console.log('FIND', filePath, newDirName);
                const files = await _findFileFromGraphql(filePath, newDirName, [FilesAttributes.IS_DIRECTORY]);

                expect(files).toHaveLength(1);
                expect(files[0]).toEqual(
                    expect.objectContaining({
                        [FilesAttributes.IS_DIRECTORY]: true
                    })
                );

                expect(await _fileExists(workDir)).toBeTruthy();
                done();
            }, 1500);
            console.log('END CALL CREATE DIR');
        });

        test('update file', async done => {
            expect.assertions(1);
            await fs.promises.writeFile(baseFile, 'new content');

            setTimeout(async () => {
                const files = await _findFileFromGraphql(filePath, fileName);

                expect(files).toHaveLength(1);
                done();
            }, 1500);
        });

        test('move in a folder', async done => {
            expect.assertions(1);
            await fs.promises.rename(baseFile, fileInBaseDir);

            setTimeout(async () => {
                const files = await _findFileFromGraphql(join(filePath, dirName), fileName);

                expect(files).toHaveLength(1);
                done();
            }, 1500);
        });

        test('rename file', async done => {
            expect.assertions(1);
            await fs.promises.rename(baseFile, workFile);

            setTimeout(async () => {
                const files = await _findFileFromGraphql(filePath, newFileName);

                expect(files).toHaveLength(1);
                done();
            }, 1500);
        });

        test('overwrite file', async done => {
            expect.assertions(2);
            await fs.promises.writeFile(workFile, '');
            await fs.promises.rename(workFile, baseFile);

            setTimeout(async () => {
                const files = await _findFileFromGraphql(filePath, fileName);
                const files2 = await _findFileFromGraphql(filePath, newFileName);

                expect(files).toHaveLength(1);
                expect(files2).toHaveLength(0);
                done();
            }, 1500);
        });

        test('move folder with file inside', async done => {
            expect.assertions(1);
            await fs.promises.rename(baseFile, fileInBaseDir);
            await fs.promises.rename(baseDir, workDir);

            setTimeout(async () => {
                const files = await _findFileFromGraphql(join(filePath, newDirName), fileName);

                expect(files).toHaveLength(1);
                done();
            }, 1500);
        });

        test('move folder with file inside into other folder', async done => {
            expect.assertions(3);
            await fs.promises.mkdir(workDir);
            await fs.promises.writeFile(fileInWorkDir, '');
            await fs.promises.rename(baseFile, fileInBaseDir);
            await fs.promises.rename(workDir, `${baseDir}/${newDirName}`);

            setTimeout(async () => {
                const directories = await _findFileFromGraphql(join(filePath, dirName), fileName);
                const files = await _findFileFromGraphql(join(filePath, dirName, newDirName), fileName);

                expect(directories).toHaveLength(1);
                expect(files).toHaveLength(1);
                expect(await _fileExists(join(rootPath, filePath, dirName, newDirName))).toBeTruthy();
                done();
            }, 1500);
        });

        test.only('remove file', async done => {
            expect.assertions(3);
            await fs.promises.unlink(baseFile);

            setTimeout(async () => {
                const res = await makeGraphQlCall(
                    `{ files(filters: [
                        {field: "${FilesAttributes.FILE_PATH}",
                        condition: EQUAL, value: "${filePath}"},
                        {operator: ${Operator.AND}},
                        {field: "${FilesAttributes.FILE_NAME}",
                        condition: EQUAL, value: "${fileName}"}
                    ]) { list {id is_directory} } }`
                );

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[library].list).toHaveLength(0);
                done();
            }, 1500);
        });
    });

    describe('FilesManager with real files', () => {
        beforeEach(() => {
            fileName = rand + '_test';
            file = join(rootPath, filePath, fileName);
        });

        afterEach(async () => {
            // clean what is created in tests
            const extList = ['', '.jpg', '.psd', '.docx', '.eps', '.mp4', '.pdf', '.odp', '.pptx'];
            for (const ext of extList) {
                if (await _fileExists(file + ext)) {
                    await fs.promises.unlink(file + ext);
                }
            }
        });

        test('create jpg with clipping path', async done => {
            expect.assertions(7);
            const jpgClippingPath = `${pathToTestsFile}/clippingPath.jpg`;
            await fs.promises.copyFile(jpgClippingPath, `${file}.jpg`);

            setTimeout(async () => {
                const recordsFind = await makeGraphQlCall(
                    `{ files(filters: [
                        {field: "${FilesAttributes.FILE_PATH}",
                        condition: EQUAL, value: "${filePath}"},
                        {operator: ${Operator.AND}},
                        {field: "${
                            FilesAttributes.FILE_NAME
                        }",                            condition: EQUAL, value: "${fileName + '.jpg'}"}
                    ]) { list {id is_directory previews previews_status} } }`
                );

                expect(recordsFind.data.data[library].list).toHaveLength(1);

                recordsFind.data.data[library].list[0].previews = JSON.parse(
                    recordsFind.data.data[library].list[0].previews
                );
                recordsFind.data.data[library].list[0].previews_status = JSON.parse(
                    recordsFind.data.data[library].list[0].previews_status
                );
                for (const preview in recordsFind.data.data[library].list[0].previews) {
                    if (preview !== 'pages') {
                        expect(recordsFind.data.data[library].list[0].previews_status[preview].status).toEqual(0);
                        expect(recordsFind.data.data[library].list[0].previews[preview]).not.toBe('');
                    }
                }

                done();
            }, 5000);
        });

        test('create jpg with rbg colorspace', async done => {
            expect.assertions(7);
            const jpgRgbColorspace = `${pathToTestsFile}/rgb.jpg`;
            await fs.promises.copyFile(jpgRgbColorspace, `${file}.jpg`);

            setTimeout(async () => {
                const recordsFind = await makeGraphQlCall(
                    `{ files(filters: [
                        {field: "${FilesAttributes.FILE_PATH}",
                        condition: EQUAL, value: "${filePath}"},
                        {operator: ${Operator.AND}},
                        {field: "${FilesAttributes.FILE_NAME}",
                        condition: EQUAL,value: "${fileName + '.jpg'}"}
                    ]) { list {id is_directory previews previews_status} } }`
                );

                expect(recordsFind.data.data[library].list).toHaveLength(1);

                recordsFind.data.data[library].list[0].previews = JSON.parse(
                    recordsFind.data.data[library].list[0].previews
                );
                recordsFind.data.data[library].list[0].previews_status = JSON.parse(
                    recordsFind.data.data[library].list[0].previews_status
                );
                for (const preview in recordsFind.data.data[library].list[0].previews) {
                    if (preview !== 'pages') {
                        expect(recordsFind.data.data[library].list[0].previews_status[preview].status).toEqual(0);
                        expect(recordsFind.data.data[library].list[0].previews[preview]).not.toBe('');
                    }
                }

                done();
            }, 5000);
        });

        test('create psd with clipping path', async done => {
            expect.assertions(7);
            const jpgRgbColorspace = `${pathToTestsFile}/clippingPath.psd`;
            await fs.promises.copyFile(jpgRgbColorspace, `${file}.psd`);

            setTimeout(async () => {
                const recordsFind = await makeGraphQlCall(
                    `{ files(filters: [
                        {field: "${FilesAttributes.FILE_PATH}", value: "${filePath}"},
                        {operator: ${Operator.AND}},
                        {field: "${FilesAttributes.FILE_NAME}", value: "${fileName + '.psd'}"}
                    ]) { list {id is_directory previews previews_status} } }`
                );

                expect(recordsFind.data.data[library].list).toHaveLength(1);

                recordsFind.data.data[library].list[0].previews = JSON.parse(
                    recordsFind.data.data[library].list[0].previews
                );
                recordsFind.data.data[library].list[0].previews_status = JSON.parse(
                    recordsFind.data.data[library].list[0].previews_status
                );
                for (const preview in recordsFind.data.data[library].list[0].previews) {
                    if (preview !== 'pages') {
                        expect(recordsFind.data.data[library].list[0].previews_status[preview].status).toEqual(0);
                        expect(recordsFind.data.data[library].list[0].previews[preview]).not.toBe('');
                    }
                }

                done();
            }, 5000);
        });

        test('create psd with no clipping path', async done => {
            expect.assertions(7);
            const jpgRgbColorspace = `${pathToTestsFile}/noClippingPath.psd`;
            await fs.promises.copyFile(jpgRgbColorspace, `${file}.psd`);

            setTimeout(async () => {
                const recordsFind = await makeGraphQlCall(
                    `{ files(filters: [
                        {field: "${FilesAttributes.FILE_PATH}", value: "${filePath}"},
                        {operator: ${Operator.AND}},
                        {field: "${
                            FilesAttributes.FILE_NAME
                        }",                            condition: EQUAL, value: "${fileName + '.psd'}"}
                    ]) { list {id is_directory previews previews_status} } }`
                );

                expect(recordsFind.data.data[library].list).toHaveLength(1);

                recordsFind.data.data[library].list[0].previews = JSON.parse(
                    recordsFind.data.data[library].list[0].previews
                );
                recordsFind.data.data[library].list[0].previews_status = JSON.parse(
                    recordsFind.data.data[library].list[0].previews_status
                );
                for (const preview in recordsFind.data.data[library].list[0].previews) {
                    if (preview !== 'pages') {
                        expect(recordsFind.data.data[library].list[0].previews_status[preview].status).toEqual(0);
                        expect(recordsFind.data.data[library].list[0].previews[preview]).not.toBe('');
                    }
                }

                done();
            }, 5000);
        });

        test('create pdf with pages', async done => {
            expect.assertions(9);
            const jpgRgbColorspace = `${pathToTestsFile}/multiPages.pdf`;
            await fs.promises.copyFile(jpgRgbColorspace, `${file}.pdf`);

            setTimeout(async () => {
                const recordsFind = await makeGraphQlCall(
                    `{ files(filters: [
                        {field: "${FilesAttributes.FILE_PATH}", value: "${filePath}"},
                        {operator: ${Operator.AND}},
                        {field: "${
                            FilesAttributes.FILE_NAME
                        }",                            condition: EQUAL, value: "${fileName + '.pdf'}"}
                    ]) { list {id is_directory previews previews_status} } }`
                );

                expect(recordsFind.data.data[library].list).toHaveLength(1);

                recordsFind.data.data[library].list[0].previews = JSON.parse(
                    recordsFind.data.data[library].list[0].previews
                );
                recordsFind.data.data[library].list[0].previews_status = JSON.parse(
                    recordsFind.data.data[library].list[0].previews_status
                );
                for (const preview in recordsFind.data.data[library].list[0].previews) {
                    if (recordsFind.data.data[library].list[0].previews[preview]) {
                        expect(recordsFind.data.data[library].list[0].previews_status[preview].status).toEqual(0);
                        expect(recordsFind.data.data[library].list[0].previews[preview]).not.toBe('');
                    }
                }

                done();
            }, 5000);
        });

        test('create odp', async done => {
            expect.assertions(9);
            const jpgRgbColorspace = `${pathToTestsFile}/odp.odp`;
            await fs.promises.copyFile(jpgRgbColorspace, `${file}.odp`);

            setTimeout(async () => {
                const recordsFind = await makeGraphQlCall(
                    `{ files(filters: [
                        {field: "${FilesAttributes.FILE_PATH}", value: "${filePath}"},
                        {operator: ${Operator.AND}},
                        {field: "${
                            FilesAttributes.FILE_NAME
                        }",                            condition: EQUAL, value: "${fileName + '.odp'}"}
                    ]) { list {id is_directory previews previews_status} } }`
                );

                expect(recordsFind.data.data[library].list).toHaveLength(1);

                recordsFind.data.data[library].list[0].previews = JSON.parse(
                    recordsFind.data.data[library].list[0].previews
                );
                recordsFind.data.data[library].list[0].previews_status = JSON.parse(
                    recordsFind.data.data[library].list[0].previews_status
                );
                for (const preview in recordsFind.data.data[library].list[0].previews) {
                    if (recordsFind.data.data[library].list[0].previews[preview]) {
                        expect(recordsFind.data.data[library].list[0].previews_status[preview].status).toEqual(0);
                        expect(recordsFind.data.data[library].list[0].previews[preview]).not.toBe('');
                    }
                }

                done();
            }, 5000);
        });

        test('create pptx', async done => {
            expect.assertions(9);
            const jpgRgbColorspace = `${pathToTestsFile}/pptx.pptx`;
            await fs.promises.copyFile(jpgRgbColorspace, `${file}.pptx`);

            setTimeout(async () => {
                const recordsFind = await makeGraphQlCall(
                    `{ files(filters: [
                        {field: "${FilesAttributes.FILE_PATH}",
                        condition: EQUAL,value: "${filePath}"},
                        {operator: ${Operator.AND}},
                        {field: "${
                            FilesAttributes.FILE_NAME
                        }",                             condition: EQUAL,value: "${fileName + '.pptx'}"}
                    ]) { list {id is_directory previews previews_status} } }`
                );

                expect(recordsFind.data.data[library].list).toHaveLength(1);

                recordsFind.data.data[library].list[0].previews = JSON.parse(
                    recordsFind.data.data[library].list[0].previews
                );
                recordsFind.data.data[library].list[0].previews_status = JSON.parse(
                    recordsFind.data.data[library].list[0].previews_status
                );
                for (const preview in recordsFind.data.data[library].list[0].previews) {
                    if (recordsFind.data.data[library].list[0].previews[preview]) {
                        expect(recordsFind.data.data[library].list[0].previews_status[preview].status).toEqual(0);
                        expect(recordsFind.data.data[library].list[0].previews[preview]).not.toBe('');
                    }
                }

                done();
            }, 5000);
        });

        test('create docx', async done => {
            expect.assertions(9);
            const jpgRgbColorspace = `${pathToTestsFile}/docx.docx`;
            await fs.promises.copyFile(jpgRgbColorspace, `${file}.docx`);

            setTimeout(async () => {
                const recordsFind = await makeGraphQlCall(
                    `{ files(filters: [
                        {field: "${FilesAttributes.FILE_PATH}", value: "${filePath}"},
                        {operator: ${Operator.AND}},
                        {field: "${FilesAttributes.FILE_NAME}", value: "${fileName + '.docx'}"}
                    ]) { list {id is_directory previews previews_status} } }`
                );

                expect(recordsFind.data.data[library].list).toHaveLength(1);

                recordsFind.data.data[library].list[0].previews = JSON.parse(
                    recordsFind.data.data[library].list[0].previews
                );
                recordsFind.data.data[library].list[0].previews_status = JSON.parse(
                    recordsFind.data.data[library].list[0].previews_status
                );
                for (const preview in recordsFind.data.data[library].list[0].previews) {
                    if (recordsFind.data.data[library].list[0].previews[preview]) {
                        expect(recordsFind.data.data[library].list[0].previews_status[preview].status).toEqual(0);
                        expect(recordsFind.data.data[library].list[0].previews[preview]).not.toBe('');
                    }
                }

                done();
            }, 5000);
        });

        test('create eps', async done => {
            expect.assertions(7);
            const jpgRgbColorspace = `${pathToTestsFile}/eps.eps`;
            await fs.promises.copyFile(jpgRgbColorspace, `${file}.eps`);

            setTimeout(async () => {
                const recordsFind = await makeGraphQlCall(
                    `{ files(filters: [
                        {field: "${FilesAttributes.FILE_PATH}", value: "${filePath}"},
                        {operator: ${Operator.AND}},
                        {field: "${FilesAttributes.FILE_NAME}", value: "${fileName + '.eps'}"}
                    ]) { list {id is_directory previews previews_status} } }`
                );

                expect(recordsFind.data.data[library].list).toHaveLength(1);
                for (const preview in recordsFind.data.data[library].list[0].previews) {
                    if (preview !== 'pages') {
                        expect(recordsFind.data.data[library].list[0].previews_status[preview].status).toEqual(0);
                        expect(recordsFind.data.data[library].list[0].previews[preview]).not.toBe('');
                    }
                }

                done();
            }, 5000);
        });

        test('create mp4 video', async done => {
            expect.assertions(7);
            const jpgRgbColorspace = `${pathToTestsFile}/mp4.mp4`;
            await fs.promises.copyFile(jpgRgbColorspace, `${file}.mp4`);

            setTimeout(async () => {
                const recordsFind = await makeGraphQlCall(
                    `{ files(filters: [
                        {field: "${FilesAttributes.FILE_PATH}", value: "${filePath}"},
                        {operator: ${Operator.AND}},
                        {field: "${FilesAttributes.FILE_NAME}", value: "${fileName + '.mp4'}"}
                    ]) { list {id is_directory previews previews_status} } }`
                );

                expect(recordsFind.data.data[library].list).toHaveLength(1);

                recordsFind.data.data[library].list[0].previews = JSON.parse(
                    recordsFind.data.data[library].list[0].previews
                );
                recordsFind.data.data[library].list[0].previews_status = JSON.parse(
                    recordsFind.data.data[library].list[0].previews_status
                );
                for (const preview in recordsFind.data.data[library].list[0].previews) {
                    if (preview !== 'pages') {
                        expect(recordsFind.data.data[library].list[0].previews_status[preview].status).toEqual(0);
                        expect(recordsFind.data.data[library].list[0].previews[preview]).not.toBe('');
                    }
                }

                done();
            }, 5000);
        });
    });
});

const _deleteFolderRecursive = async (path: string) => {
    if (await _fileExists(path)) {
        const files = await fs.promises.readdir(path);

        for (const f of files) {
            const curPath = path + '/' + f;
            const stat = await fs.promises.lstat(curPath);

            if (stat.isDirectory()) {
                // recursive
                await _deleteFolderRecursive(curPath);
            } else {
                // delete file
                await fs.promises.unlink(curPath);
            }
        }

        await fs.promises.rmdir(path);
    }
};
