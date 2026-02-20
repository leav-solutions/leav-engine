// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IApplication} from '_types/application';
import {type i18n} from 'i18next';
import {type IConfig} from '_types/config';

export interface IGetLibrarySystemPanelsHelperDeps {
    translator: i18n;
    config: IConfig;
}

export interface IGetLibrarySystemPanelsHelper {
    getLibrarySystemPanels: (libraryId: string) => IApplication['appStudioSettings'];
}

export default function ({translator, config}: IGetLibrarySystemPanelsHelperDeps): IGetLibrarySystemPanelsHelper {
    return {
        getLibrarySystemPanels(libraryId: string): IApplication['appStudioSettings'] {
            return {
                system: {
                    libraryPanels: [
                        {
                            id: `${libraryId}_list`,
                            type: 'explorer',
                            actions: [
                                {
                                    where: 'popup',
                                    what: 'record',
                                    icon: 'fa-pen',
                                    label: config.lang.available.reduce((labels, lang) => {
                                        labels[lang] = `${translator.t('appStudio.edit', {lng: lang})}`;
                                        return labels;
                                    }, {}),
                                    onRowClick: true,
                                },
                            ],
                        },
                    ],
                    recordPanels: [
                        {
                            id: `${libraryId}_edition`,
                            type: 'editionForm',
                            formId: 'edition',
                        },
                        {
                            id: `${libraryId}_creation`,
                            type: 'creationForm',
                            formId: 'creation',
                            isStandalone: true,
                        },
                    ],
                },
            };
        },
    };
}
