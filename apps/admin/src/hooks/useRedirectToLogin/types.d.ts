// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/// <reference types="vite/client" />

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMetaEnv {
    readonly VITE_CUSTOM_ENV_VARIABLE: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
