// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IFakeDomain {
    execWorker({fromTask}: {fromTask: string}): void;
    startPlugin(): void;
    getPluginStarted(): boolean;
}

export default function (): IFakeDomain {
    let pluginStarted: boolean = false;

    return {
        async execWorker(params): Promise<void> {
            void params;
        },
        startPlugin(): void {
            pluginStarted = true;
        },
        getPluginStarted(): boolean {
            return pluginStarted;
        },
    };
}
