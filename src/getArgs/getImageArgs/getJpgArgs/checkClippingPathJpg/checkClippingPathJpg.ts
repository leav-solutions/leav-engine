import {exec} from 'child_process';

export const checkClippingPathJpg = async (input: string) => {
    let clippingPath = true;
    const commandTestClip = `identify -clip ${input}`;

    const error = await new Promise(r => exec(commandTestClip, e => r(e)));

    if (error) {
        clippingPath = false;
    }

    return clippingPath;
};
