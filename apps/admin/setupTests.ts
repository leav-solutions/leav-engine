import '@testing-library/jest-dom';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {webcrypto} from 'node:crypto';

dayjs.extend(duration);

Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
});
