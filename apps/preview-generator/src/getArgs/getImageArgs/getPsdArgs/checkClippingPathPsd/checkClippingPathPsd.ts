import {execFile} from 'child_process';

export const checkClippingPathPsd = async (input: string): Promise<boolean> => {
    let clippingPath = true;

    const [error, result] = await new Promise(r =>
        execFile('identify', ['-format', '%[8BIM:1999,2998:#1]', input], {}, (err, stdout) => r([err, stdout]))
    );

    if (result.length === 0 || error) {
        clippingPath = false;
    }

    return clippingPath;
};
