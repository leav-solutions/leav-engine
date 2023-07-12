// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {i18n} from 'i18next';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import getLibraryDefaultAttributes from '../../../utils/helpers/getLibraryDefaultAttributes';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {FilesAttributes} from '../../../_types/filesManager';
import {ILibrary, LibraryBehavior} from '../../../_types/library';
import {TreeBehavior} from '../../../_types/tree';

interface IDeps {
    treeRepo: ITreeRepo;
    libraryRepo: ILibraryRepo;
    attributeRepo: IAttributeRepo;
    utils: IUtils;
    translator: i18n;
    config: IConfig;
}

const _filesBehavior = async (library: ILibrary, isNewLib: boolean, deps: IDeps, ctx: IQueryInfos): Promise<any> => {
    if (!isNewLib) {
        return;
    }

    // Create previews and previews status attributes for library if they don't exist. If they exist, update settings
    const previewsAttributeId = deps.utils.getPreviewsAttributeName(library);
    const previewsStatusAttributeId = deps.utils.getPreviewsStatusAttributeName(library);
    const attributesSettings = deps.utils.getPreviewAttributesSettings(library);

    // Previews attribute
    const previewsAttributeData = {
        id: previewsAttributeId,
        label: deps.config.lang.available.reduce((labels, lang) => {
            labels[lang] = deps.translator.t('files.previews', {lng: lang});

            return labels;
        }, {}),
        system: true,
        readonly: true,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.EXTENDED,
        multiple_values: false,
        embedded_fields: attributesSettings[previewsAttributeId]
    };

    await deps.attributeRepo.createAttribute({
        attrData: {
            ...previewsAttributeData,
            actions_list: deps.utils.getDefaultActionsList(previewsAttributeData)
        },
        ctx
    });

    // Previews status attribute
    const previewsStatusAttributeData = {
        id: previewsStatusAttributeId,
        label: deps.config.lang.available.reduce((labels, lang) => {
            labels[lang] = deps.translator.t('files.previews_status', {lng: lang});

            return labels;
        }, {}),
        system: true,
        readonly: true,
        type: AttributeTypes.SIMPLE,
        format: AttributeFormats.EXTENDED,
        multiple_values: false,
        embedded_fields: attributesSettings[previewsStatusAttributeId]
    };

    await deps.attributeRepo.createAttribute({
        attrData: {
            ...previewsStatusAttributeData,
            actions_list: deps.utils.getDefaultActionsList(previewsStatusAttributeData)
        },
        ctx
    });

    // Associate attributes to library
    await deps.libraryRepo.saveLibraryAttributes({
        libId: library.id,
        attributes: [
            ...getLibraryDefaultAttributes(LibraryBehavior.FILES, library.id),
            previewsAttributeId,
            previewsStatusAttributeId
        ],
        ctx
    });

    // Create directories libraries
    const directoriesLibraryId = deps.utils.getDirectoriesLibraryId(library.id);
    await deps.libraryRepo.createLibrary({
        libData: {
            id: directoriesLibraryId,
            behavior: LibraryBehavior.DIRECTORIES,
            system: false,
            label: deps.config.lang.available.reduce((labels, lang) => {
                labels[lang] = deps.translator.t('files.directories', {lng: lang});

                return labels;
            }, {}),
            recordIdentityConf: {
                label: FilesAttributes.FILE_NAME
            }
        },
        ctx
    });

    await deps.libraryRepo.saveLibraryAttributes({
        libId: directoriesLibraryId,
        attributes: getLibraryDefaultAttributes(LibraryBehavior.DIRECTORIES, directoriesLibraryId),
        ctx
    });

    // Create tree
    deps.treeRepo.createTree({
        treeData: {
            id: deps.utils.getLibraryTreeId(library.id),
            system: false,
            label: library.label,
            behavior: TreeBehavior.FILES,
            libraries: {
                [directoriesLibraryId]: {
                    allowMultiplePositions: false,
                    allowedAtRoot: true,
                    allowedChildren: [directoriesLibraryId, library.id]
                },
                [library.id]: {
                    allowMultiplePositions: false,
                    allowedAtRoot: true,
                    allowedChildren: []
                }
            }
        },
        ctx
    });
};

export default (library: ILibrary, isNewLib: boolean, deps: IDeps, ctx: IQueryInfos): Promise<void> => {
    const actionByBehavior = {
        [LibraryBehavior.FILES]: () => _filesBehavior(library, isNewLib, deps, ctx)
    };

    return actionByBehavior[library.behavior] ? actionByBehavior[library.behavior]() : null;
};
