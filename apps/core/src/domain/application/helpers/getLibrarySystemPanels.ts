// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IApplication} from '_types/application';
import {type i18n} from 'i18next';
import {type IConfig} from '_types/config';
import {EXPLORER_STUDIO_APPLICATION} from '../../../_constants/globalSettings';

export interface IGetLibrarySystemPanelsHelperDeps {
    translator: i18n;
    config: IConfig;
}

export interface IGetLibrarySystemPanelsHelper {
    getLibrarySystemPanels: (libraryId: string, applicationId: string) => IApplication['appStudioSettings'];
}

export default function ({translator, config}: IGetLibrarySystemPanelsHelperDeps): IGetLibrarySystemPanelsHelper {
    return {
        getLibrarySystemPanels(libraryId: string, applicationId: string): IApplication['appStudioSettings'] {
            return {
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
                        ...(applicationId === EXPLORER_STUDIO_APPLICATION
                            ? {
                                  explorerProps: {
                                      showSearch: true,
                                      showFilters: true,
                                      showSorts: true,
                                      showAttributeLabels: true,
                                      freezeView: false,
                                  },
                              }
                            : {}),
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
            };
        },
    };
}
