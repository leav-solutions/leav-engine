// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom/';
import '@testing-library/jest-dom/extend-expect';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {webcrypto} from 'node:crypto';

dayjs.extend(duration);

Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
});
