import {loadLocalesForDayjs} from '../utils/configureDayjs';

beforeAll(async () => {
    await loadLocalesForDayjs({
        available: ['en', 'fr'],
        default: 'en',
    });
});

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
