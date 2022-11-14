// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IUtils} from 'utils/utils';
import {IMigration} from '_types/migration';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {IAttributeForRepo, IAttributeRepo} from '../../attribute/attributeRepo';
import {IValueRepo} from '../../value/valueRepo';
import {ILibraryRepo} from '../../library/libraryRepo';
import {IDbService} from '../dbService';
import {IConfig} from '../../../_types/config';
import {ActionsListEvents} from '../../../_types/actionsList';

interface IDeps {
    config?: IConfig;
    'core.infra.db.dbService'?: IDbService;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.value'?: IValueRepo;
    'core.utils'?: IUtils;
}

export default function ({
    config = null,
    'core.infra.db.dbService': dbService = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.attribute': attributeRepo = null
}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            // Create attributes
            const commonAttributeData = {
                system: true,
                multiple_values: false
            };

            const emailAttr: IAttributeForRepo = {
                ...commonAttributeData,
                id: 'email',
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {fr: 'Email', en: 'Email'},
                multiple_values: false,
                readonly: false,
                versions_conf: {versionable: false},
                actions_list: {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            id: 'validateFormat',
                            name: 'Validate Format',
                            is_system: true
                        },
                        {
                            id: 'validateEmail',
                            name: 'Validate Email',
                            is_system: true
                        }
                    ],
                    [ActionsListEvents.GET_VALUE]: [],
                    [ActionsListEvents.DELETE_VALUE]: []
                }
            };

            // Check if attribute already exists
            const attributeFromDb = await attributeRepo.getAttributes({
                params: {
                    filters: {
                        id: emailAttr.id
                    },
                    strictFilters: true,
                    withCount: false
                },
                ctx
            });

            // It already exists, move on
            if (attributeFromDb.list.length) {
                return;
            }

            // Let's create it
            await attributeRepo.createAttribute({
                attrData: emailAttr,
                ctx: {}
            });

            // Save default attributes to users library
            await libraryRepo.saveLibraryAttributes({
                libId: 'users',
                attributes: [
                    'id',
                    'created_by',
                    'created_at',
                    'modified_by',
                    'modified_at',
                    'login',
                    'password',
                    'email'
                ],
                ctx
            });

            await dbService.execute({
                query: `
                    LET doc = DOCUMENT("users/1")
                    UPDATE doc WITH {
                        email: "${config.server.admin.email}"
                    } IN users
                `,
                ctx
            });
        }
    };
}
