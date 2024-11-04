// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
