import {exec} from 'child_process';

// Check if image has a clipping path
export const hasClippingPath = async (input: string): Promise<boolean> => {
    let clippingPath = true;
    const commandTestClip = `identify -clip "${input}"`;

    const error = await new Promise(r => exec(commandTestClip, e => r(e)));

    if (error) {
        clippingPath = false;
    }

    return clippingPath;
};
