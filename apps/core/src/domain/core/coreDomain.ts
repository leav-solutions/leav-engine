export interface ICoreDomain {
    getVersion(): string;
}

export default function (): ICoreDomain {
    return {
        getVersion(): string {
            return process.env.npm_package_version ?? '';
        },
    };
}
