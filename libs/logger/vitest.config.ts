// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['**/*.spec.ts'],
        typecheck: {tsconfig: './tsconfig.spec.json'},
    },
});
