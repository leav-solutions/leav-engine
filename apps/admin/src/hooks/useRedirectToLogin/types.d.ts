/// <reference types="vite/client" />

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMetaEnv {
    readonly VITE_CUSTOM_ENV_VARIABLE: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
