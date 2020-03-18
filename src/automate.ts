import moment from 'moment';
import crypto from 'crypto';

let databaseDirectories = [];
let databaseFiles = [];
let filesystemDirectories = [];
let filesystemFiles = [];

const _splitDatabaseElements = async database => {
    let toList = [];

    const dir = database.filter(e => e.record.is_directory);
    const fil = database.filter(e => !e.record.is_directory);

    databaseDirectories = databaseDirectories.concat(dir);
    databaseFiles = databaseFiles.concat(fil);

    for (const d of dir) {
        toList = toList.concat(d.children);
        delete d.children;
    }

    if (toList.length) {
        _splitDatabaseElements(toList);
    }

    return;
};

const _splitFilesystemElements = async filesystem => {
    filesystemDirectories = filesystem.filter(e => e.type === 'directory');
    filesystemFiles = filesystem.filter(e => e.type === 'file');
};

const _processing = async level => {
    // DIRECTORIES
    // console.log('DB DIRECTORIES: ', databaseDirectories);
    // console.log('FILESYSTEM: ', filesystem);

    if (!filesystemDirectories.filter(dir => dir.level === level).length) {
        return;
    }

    for (const directory of filesystemDirectories) {
        // FIXME: TEMPORARY
        // TODO: Use hash from database instead (ino + name + path + mtime)
        if (directory.level === level) {
            const found = databaseDirectories.find(d => {
                // d.record.inode === directory.ino

                console.log('FS');
                console.log(directory.ino);
                console.log(directory.name);
                console.log(directory.path);
                console.log(moment(directory.mtime).unix());

                console.log('_____');

                console.log('DATABASE');
                console.log(d.record.inode);
                console.log(d.record.file_name);
                console.log(d.record.file_path);
                console.log(d.record.modified_at);

                return (
                    directory.md5 ===
                    crypto
                        .createHash('md5')
                        .update(d.record.inode + d.record.file_name + d.record.file_path + d.record.modified_at)
                        .digest('hex')
                );
            });

            if (typeof found !== 'undefined') {
                directory.trt = true;
            }
        }
    }

    _processing(level + 1);
};

export default async (filesystem, database) => {
    await _splitDatabaseElements(database);
    await _splitFilesystemElements(filesystem);

    await _processing(0);
    // console.log(filesystemDirectories);
    //  console.log('___DIRECTORIES___', dbDirectories);
    // console.log('___FILES___', dbFiles);
};
