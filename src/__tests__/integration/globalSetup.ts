import {config} from '../../config';
export async function setup() {
    try {
        const conf: any = await config;

        // Do whatever you need to setup your integration tests
    } catch (e) {
        console.error(e);
    }
}
