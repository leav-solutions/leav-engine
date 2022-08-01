// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IAttributeForRepo, IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IMigration} from '_types/migration';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../../_types/attribute';
import {LibraryBehavior} from '../../../_types/library';
import {IUtils} from 'utils/utils';
import {collectionTypes, IDbService} from '../dbService';

interface IDeps {
    config?: any;
    'core.infra.db.dbService'?: IDbService;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.library'?: ILibraryRepo;
    'core.utils'?: IUtils;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.attribute': attributeRepo = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.infra.library': libraryRepo = null,
    'core.utils': utils = null,
    config
}: IDeps): IMigration {
    return {
        async run(ctx) {
            const existingAttributes = await attributeDomain.getAttributes({ctx});
            const attributesById: {[key: string]: IAttribute} = existingAttributes.list.reduce((attrs, curAttr) => {
                attrs[curAttr.id] = curAttr;
                return attrs;
            }, {});

            // Create attributes need for tasks manager

            const commonAttributeData = {
                system: true,
                multiple_values: false
            };

            const attributesToCreate: IAttributeForRepo[] = [
                {
                    ...commonAttributeData,
                    id: 'moduleName',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Nom du module', en: 'Module Name'}
                },
                {
                    ...commonAttributeData,
                    id: 'funcName',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Nom de la fonction', en: 'Function name'}
                },
                {
                    ...commonAttributeData,
                    id: 'funcArgs',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Paramètres de la fonction', en: 'Function arguments'}
                },
                {
                    ...commonAttributeData,
                    id: 'startAt',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.DATE,
                    label: {fr: 'Commence le', en: 'Start at'}
                },
                {
                    ...commonAttributeData,
                    id: 'status',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Status', en: 'Status'}
                },
                {
                    ...commonAttributeData,
                    id: 'progress',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {fr: 'Progression', en: 'Progress'}
                },
                {
                    ...commonAttributeData,
                    id: 'startedAt',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {fr: 'Commencé le', en: 'Started at'}
                },
                {
                    ...commonAttributeData,
                    id: 'completedAt',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {fr: 'Terminé le', en: 'Completed at'}
                },
                {
                    ...commonAttributeData,
                    id: 'links',
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Liens', en: 'Links'}
                }
            ];

            for (const attribute of attributesToCreate) {
                // It already exists, move on
                if (typeof attributesById[attribute.id] !== 'undefined') {
                    continue;
                }

                // Let's create it
                await attributeRepo.createAttribute({
                    attrData: {
                        ...attribute,
                        actions_list: utils.getDefaultActionsList(attribute)
                    },
                    ctx: {}
                });
            }

            // Create "core_tasks" collection
            if (!(await dbService.collectionExists('core_tasks'))) {
                await libraryRepo.createLibrary({
                    libData: {
                        id: 'core_tasks',
                        system: true,
                        behavior: LibraryBehavior.STANDARD,
                        label: {fr: 'Tâches', en: 'Tasks'}
                    },
                    ctx
                });

                await libraryRepo.saveLibraryAttributes({
                    libId: 'core_tasks',
                    attributes: [
                        'id',
                        'active',
                        'created_by',
                        'created_at',
                        'modified_by',
                        'modified_at',
                        'moduleName',
                        'funcName',
                        'funcArgs',
                        'startAt',
                        'status',
                        'progress',
                        'startedAt',
                        'completedAt',
                        'links'
                    ],
                    ctx
                });
            }
        }
    };
}
