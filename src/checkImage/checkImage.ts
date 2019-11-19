import * as child_process from 'child_process';
import {execImageWithClip, execImage} from '../execImage/execImage';
import {execPsd, execPsdWithClip} from '../execPsd/execPsd';

export const checkClipJpg = (input: string, output: string, imgArgs: string[]) => {
    let clippingPath = true;

    try {
        const commandTest = `identify -clip ${input}`;
        child_process.execSync(commandTest, {
            stdio: 'pipe'
        });
    } catch (e) {
        if (e.message.indexOf('no clip path') !== false) {
            clippingPath = false;
        }
    }

    if (clippingPath) {
        return execImageWithClip(output, imgArgs);
    } else {
        return execImage(output, imgArgs);
    }
};

export const checkClipPsd = (input: string, output: string, imgArgs: string[]) => {
    let clippingPath = true;
    try {
        const res = child_process.execFileSync('identify', ['-format', '%[8BIM:1999,2998:#1]', input], {
            stdio: 'pipe'
        });

        if (res.length === 0) {
            clippingPath = false;
        }
    } catch (e) {
        console.error('error when identify clipping path psd', input, e);
    }

    if (clippingPath) {
        return execPsdWithClip(output, imgArgs);
    } else {
        return execPsd(output, imgArgs);
    }
};
