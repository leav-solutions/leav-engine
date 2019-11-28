import {execFileSync} from 'child_process';

export const checkClippingPathPsd = (input: string) => {
    let clippingPath = true;

    try {
        const result = execFileSync('identify', ['-format', '%[8BIM:1999,2998:#1]', input], {
            stdio: 'pipe',
        });
        if (result.length === 0) {
            clippingPath = false;
        }
    } catch (e) {
        clippingPath = false;
    }

    return clippingPath;
};
