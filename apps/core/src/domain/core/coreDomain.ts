import packageJson from '../../../package.json';

export interface ICoreDomain {
    getVersion(): string;
}

export default function (): ICoreDomain {
    return {
        getVersion(): string {
            return packageJson.version ?? '';
        },
    };
}
