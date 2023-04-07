// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface ICoreDomain {
    getVersion(): string;
}

export default function (): ICoreDomain {
    return {
        getVersion(): string {
            return process.env.npm_package_version ?? '';
        }
    };
}
