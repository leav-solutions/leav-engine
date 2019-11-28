import {execSync} from 'child_process';

export const checkClippingPathJpg = (input: string) => {
    let clippingPath = true;
    try {
        const commandTestClip = `identify -clip ${input}`;
        execSync(commandTestClip, {
            stdio: 'pipe',
        });
    } catch (e) {
        clippingPath = false;
    }

    return clippingPath;
};
