// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {isFileAllowed} from '@leav/utils';
import * as chokidar from 'chokidar';
import {createHash} from 'crypto';
import {createReadStream, Stats} from 'fs';
import {join} from 'path';
import {getConfig} from '../';
import {getInode, setData} from '../redis/redis';
import {IAmqpParams, IParams, IParamsExtends, IWatcherParams} from '../types';
import {handleCreate, handleDelete, handleMove, handleUpdate} from './events';

const inodesTmp: {[i: number]: string} = {};
const timeoutRefs: {[i: number]: any} = {};
const pathsTmp: {[i: string]: any} = {};

const SEPARATOR_CHARACTERS = ', ';
const getSplittedListFiles = (list: string): string[] => list.split(SEPARATOR_CHARACTERS).filter(p => p);

// Temporary array of the infos to set in redis at init
const inits: Array<{path: string; inode: number}> = [];
let initsCount = 0;

export const start = async (
    rootPathProps: string,
    rootKey: string,
    watchParams?: IWatcherParams,
    amqpParams?: IAmqpParams
) => {
    const verbose = watchParams?.verbose ?? false;
    let ready = false;
    const watcherConfig = (watchParams && watchParams.awaitWriteFinish) || false;
    const delay = (watchParams && watchParams.delay) || 100;
    // if absolute path given, we use it here to not display the name of the root folder in message
    const cwd = rootPathProps.charAt(0).indexOf('/') === 0 ? rootPathProps : '.';

    const watcher = chokidar.watch(rootPathProps, {
        ignoreInitial: false, // use init for redis
        alwaysStat: true, // always give stats for add and update event
        awaitWriteFinish: watcherConfig, // wait for copy to finish before trigger event
        cwd
    });

    watcher.on('all', async (event: string, path: string, stats: any) =>
        checkEvent(
            event,
            path,
            {
                ready,
                delay,
                rootPath: rootPathProps,
                rootKey,
                verbose,
                amqp: amqpParams
            },
            stats
        )
    );

    watcher.on('ready', () => {
        console.info(`Initialized ${initsCount} files. Waiting for events...`);
        ready = true;
    });

    return watcher;
};

export const checkEvent = async (event: string, path: string, params: IParamsExtends, stats?: any) => {
    const config = await getConfig();

    const allowList = getSplittedListFiles(config.allowFilesList);
    const ignoreList = getSplittedListFiles(config.ignoreFilesList);

    const isAllowed = isFileAllowed(config.rootPath, allowList, ignoreList, config.rootPath + '/' + path);

    if (params.ready) {
        const inode = await manageInode(path, stats);
        const isDirectory = manageIsDirectory(stats);
        await _checkMove(event, path, isDirectory, inode, params);
    } else if (isAllowed) {
        _handleInit(path, stats?.ino, params.verbose);
    }
};

export const manageInode = async (path: string, stats?: Stats) => {
    if (!!stats) {
        // Get the inode from the stats (events: add, addDir, Change)
        return stats.ino;
    } else if (pathsTmp[path]) {
        // Get the inode from array that keep temporary the inode the time,
        return pathsTmp[path];
    }

    // Get the inode from redis database
    return getInode(path);
};

export const manageIsDirectory = (stats?: Stats): boolean => (!!stats && stats.isDirectory()) || false;

const _checkMove = async (event: string, path: string, isDirectory: boolean, inode: any, params: IParamsExtends) => {
    if (inodesTmp[inode] && path !== inodesTmp[inode]) {
        const pathBefore = inodesTmp[inode];
        const pathAfter = path;

        // save the inode if the next unlink arrive before the create finish to stock data in redis
        pathsTmp[path] = inode;

        // cancel other event
        clearTmp(path, inode);

        // delay this event to keep the order of events
        // because all events are delayed below
        await new Promise(res =>
            setTimeout(
                () =>
                    res(
                        handleEvent(
                            'move',
                            pathAfter,
                            isDirectory,
                            inode,
                            {
                                rootPath: params.rootPath,
                                rootKey: params.rootKey,
                                amqp: params.amqp || {},
                                verbose: params.verbose
                            },
                            pathBefore
                        )
                    ),
                params.delay
            )
        );
    } else {
        inodesTmp[inode] = path;
        pathsTmp[path] = inode;

        // wait the time of params.delay in case it is
        // a move event (unlink + an add event)
        await new Promise(res => {
            timeoutRefs[inode] = setTimeout(
                () =>
                    res(
                        handleEvent(event, path, isDirectory, inode, {
                            rootPath: params.rootPath,
                            rootKey: params.rootKey,
                            verbose: params.verbose,
                            amqp: params.amqp
                        })
                    ),
                params.delay
            );
        });
    }
};

export const handleEvent = async (
    event: string,
    path: string,
    isDirectory: boolean,
    inode: number,
    params: IParams,
    oldPath?: string
) => {
    const config = await getConfig();
    let hashFile: string | undefined;
    const amqp = {
        rootPath: params.rootPath,
        rootKey: params.rootKey,
        verbose: params.verbose,
        amqp: params.amqp
    };

    const allowList = getSplittedListFiles(config.allowFilesList);
    const ignoreList = getSplittedListFiles(config.ignoreFilesList);

    const pathAllowed = isFileAllowed(config.rootPath, allowList, ignoreList, config.rootPath + '/' + path);
    const oldPathAllowed =
        typeof oldPath === 'undefined' ||
        isFileAllowed(config.rootPath, allowList, ignoreList, config.rootPath + '/' + oldPath);

    switch (event) {
        case 'addDir':
        case 'add':
            if (pathAllowed) {
                if (event !== 'addDir') {
                    hashFile = await _createHashFromFile(join(params.rootPath, path));
                }

                await handleCreate(path, inode, amqp, isDirectory, hashFile);
            }

            break;
        case 'unlink':
        case 'unlinkDir':
            if (pathAllowed) {
                await handleDelete(path, inode, amqp, event === 'unlinkDir');
            }

            break;
        case 'change':
            if (pathAllowed) {
                if (!isDirectory) {
                    hashFile = await _createHashFromFile(join(params.rootPath, path));
                }

                await handleUpdate(path, inode, amqp, isDirectory, hashFile);
            }

            break;
        case 'move':
            if (!!oldPath) {
                if (!oldPathAllowed && pathAllowed) {
                    // hidden to not hidden -> create new
                    await handleCreate(path, inode, amqp, isDirectory, hashFile);
                } else if (oldPathAllowed && !pathAllowed) {
                    // not hidden to hidden -> del old path
                    await handleDelete(oldPath, inode, amqp, isDirectory);
                } else if (oldPathAllowed && pathAllowed) {
                    await handleMove(oldPath, path, inode, amqp, isDirectory);
                }
            }

            break;
        default:
            console.error('event not managed : ' + event);
            break;
    }

    clearTmp(path, inode);
};

// Flag to check if already sending inits to redis
let working = false;

const _handleInit = async (path: string, inode: number, verbose: IWatcherParams['verbose']) => {
    inits.push({path, inode}); // add init infos to queue
    initsCount++;
    _manageRedisInit(verbose);
};

const _manageRedisInit = async (verbose: IWatcherParams['verbose']) => {
    // if not already working, shit
    if (!working) {
        working = true;

        // while the array of inits is not empty
        while (inits.length > 0) {
            const init = inits.shift();

            if (init) {
                await setData(init.path, init.inode); // set data in redis and wait until finish

                if (verbose === 'very') {
                    console.info('init', init.path);
                }
            }
        }

        working = false;
    }
};

const clearTmp = (path: string, inode: number) => {
    clearTimeout(timeoutRefs[inode]);

    delete timeoutRefs[inode];
    delete inodesTmp[inode];
    delete pathsTmp[path];
};

const _createHashFromFile = async (filePath: string): Promise<string> => {
    try {
        const hash = createHash('md5');

        return new Promise((resolve, reject) =>
            createReadStream(filePath)
                .on('error', err => {
                    reject(err);
                })
                .on('data', data => hash.update(data))
                .on('end', () => resolve(hash.digest('hex')))
        );
    } catch (e) {
        console.error(`Can't get hash from file ${filePath}`, e);
        return '';
    }
};
