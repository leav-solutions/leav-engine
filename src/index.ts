import {getConfig} from './getConfig/getConfig';
import {startConsume} from './amqp/startConsume';

(async function() {
    try {
        const config = await getConfig();
        await startConsume(config);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})().catch(e => console.error(e));

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
