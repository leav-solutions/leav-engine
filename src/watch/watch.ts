import * as chokidar from 'chokidar';
import {createHash} from 'crypto';
import {createReadStream, Stats} from 'fs';
import {join} from 'path';
import {getInode, initRedis} from '../redis/redis';
import {IAmqpParams, IParams, IParamsExtends, IWatcherParams} from '../types';
import {handleCreate, handleDelete, handleMove, handleUpdate} from './events';

const inodesTmp: {[i: number]: string} = {};
const timeoutRefs: {[i: number]: any} = {};
const pathsTmp: {[i: string]: any} = {};

export const start = async (
    rootPathProps: string,
    rootKey: string,
    watchParams?: IWatcherParams,
    amqpParams?: IAmqpParams
) => {
    const verbose = (watchParams && watchParams.verbose) || false;

    let ready = false;
    const watcherConfig = (watchParams && watchParams.awaitWriteFinish) || false;
    const delay = (watchParams && watchParams.delay) || 100;

    // if absolute path given, we use it here to not display the name of the root folder in message
    const cwd = rootPathProps.charAt(0).indexOf('/') === 0 ? rootPathProps : '.';

    const watcher = chokidar.watch(rootPathProps, {
        ignored: /(^|[\/\\])\../, // ignore dot file
        ignoreInitial: false, // use init for redis
        alwaysStat: true, // always give stats for add and update event
        awaitWriteFinish: watcherConfig, // wait for copy to finish before trigger event
        cwd
    });

    watcher.on('all', async (event: string, path: string, stats: any) =>
        checkEvent(event, path, stats, {
            ready,
            delay,
            rootPath: rootPathProps,
            rootKey,
            verbose,
            amqp: amqpParams
        })
    );

    watcher.on('ready', () => {
        ready = true;
    });

    return watcher;
};

export const checkEvent = async (event: string, path: string, stats: any, params: IParamsExtends) => {
    if (params.ready) {
        const inode = await manageInode(path, stats);
        const isDirectory = await manageIsDirectory(stats);
        await checkMove(event, path, isDirectory, inode, params);
    } else {
        handleInit(path, stats.ino, params.verbose);
    }
};
export const manageInode = async (path: string, stats: Stats) => {
    let inode: number;

    if (stats) {
        // Get the inode from the stats (events: add, addDir, Change)
        inode = stats.ino;
    } else if (pathsTmp[path]) {
        // Get the inode from array that keep temporary the inode the time,
        inode = pathsTmp[path];
    } else {
        // Get the inode from redis database
        inode = await getInode(path);
    }

    return inode;
};

export const manageIsDirectory = async (stats: Stats) => {
    let isDirectory = false;

    if (stats) {
        // Get isDirectory from the stats
        isDirectory = stats.isDirectory();
    }

    return isDirectory;
};

const checkMove = async (event: string, path: string, isDirectory: boolean, inode: any, params: IParamsExtends) => {
    const amqp = params.amqp || {};

    if (inodesTmp[inode] && path !== inodesTmp[inode]) {
        let pathBefore: string;
        let pathAfter: string;

        if (event === 'add' || event === 'addDir') {
            pathBefore = path;
            pathAfter = inodesTmp[inode];
        } else {
            pathBefore = inodesTmp[inode];
            pathAfter = path;
        }

        // save the inode if the next unlink arrive before the create finish to stock data in redis
        pathsTmp[path] = inode;

        // cancel other event
        clearTmp(path, inode);

        // delay on move event to keep the order of the event
        setTimeout(async () => {
            await handleEvent(
                'move',
                pathBefore,
                isDirectory,
                inode,
                {
                    rootPath: params.rootPath,
                    rootKey: params.rootKey,
                    amqp,
                    verbose: params.verbose
                },
                pathAfter
            );
        }, params.delay);
    } else {
        inodesTmp[inode] = path;
        pathsTmp[path] = inode;

        await new Promise(
            resolve =>
                (timeoutRefs[inode] = setTimeout(
                    async () =>
                        resolve(
                            handleEvent(event, path, isDirectory, inode, {
                                rootPath: params.rootPath,
                                rootKey: params.rootKey,
                                verbose: params.verbose,
                                amqp: params.amqp
                            })
                        ),
                    params.delay
                ))
        );
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
    const amqp = {
        rootPath: params.rootPath,
        rootKey: params.rootKey,
        verbose: params.verbose,
        amqp: params.amqp
    };

    let hashFile: string;
    switch (event) {
        case 'addDir':
            isDirectory = true;
        case 'add':
            hashFile = await _createHashFromFile(join(params.rootPath, path));
            if (!isDirectory) {
            }
            await handleCreate(path, inode, amqp, isDirectory, hashFile);
            break;
        case 'unlinkDir':
            isDirectory = true;
        case 'unlink':
            await handleDelete(path, inode, amqp, isDirectory);
            break;
        case 'change':
            if (!isDirectory) {
                hashFile = await _createHashFromFile(join(params.rootPath, path));
            }
            await handleUpdate(path, inode, amqp, isDirectory, hashFile);
            break;
        case 'move':
            if (oldPath) {
                await handleMove(oldPath, path, inode, amqp, isDirectory);
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
// Temporary array of the infos to set in redis at init
const inits: Array<{path: string; inode: number}> = [];

const handleInit = async (path: string, inode: number, verbose: boolean) => {
    inits.push({path, inode}); // add init infos to queue
    manageRedisInit(verbose);
};

const manageRedisInit = async (verbose: boolean) => {
    // if not already working, shit
    if (!working) {
        working = true;

        // while the array of inits is not empty
        while (inits.length > 0) {
            const init = inits.shift();
            if (init) {
                await initRedis(init.path, init.inode); // set data in redis and wait until finish
                if (verbose) {
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
    let hashFile: string;
    try {
        const hash = createHash('md5');

        hashFile = await new Promise((resolve, reject) =>
            createReadStream(filePath)
                .on('error', err => {
                    reject(err);
                })
                .on('data', data => hash.update(data))
                .on('end', () => resolve(hash.digest('hex')))
        );
        return hashFile;
    } catch (e) {
        console.error(`Can't get hash from file ${filePath}`, e);
        return '';
    }
};
