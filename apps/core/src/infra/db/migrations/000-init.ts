// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import moment from 'moment';
import {IUtils} from 'utils/utils';
import {IMigration} from '_types/migration';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {IAttributeForRepo, IAttributeRepo} from '../../attribute/attributeRepo';
import {ILibraryRepo} from '../../library/libraryRepo';
import {collectionTypes, IDbService} from '../dbService';
import {IConfig} from '../../../_types/config';
import * as bcrypt from 'bcryptjs';

interface IDeps {
    config?: IConfig;
    'core.infra.db.dbService'?: IDbService;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.attribute'?: IAttributeRepo;
    'core.utils'?: IUtils;
}

export default function ({
    config = null,
    'core.infra.db.dbService': dbService = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.attribute': attributeRepo = null,
    'core.utils': utils = null
}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            if (!(await dbService.collectionExists('core_attributes'))) {
                await dbService.createCollection('core_attributes');
            }

            // Create attributes
            const commonAttributeData = {
                system: true,
                multiple_values: false
            };
            const attributesToCreate: IAttributeForRepo[] = [
                {
                    ...commonAttributeData,
                    id: 'id',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Identifiant', en: 'Identifier'}
                },
                {
                    ...commonAttributeData,
                    id: 'created_by',
                    linked_library: 'users',
                    type: AttributeTypes.SIMPLE_LINK,
                    label: {fr: 'Créé par', en: 'Created by'}
                },
                {
                    ...commonAttributeData,
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.DATE,
                    label: {fr: 'Date de création', en: 'Creation date'}
                },
                {
                    ...commonAttributeData,
                    id: 'modified_by',
                    linked_library: 'users',
                    type: AttributeTypes.SIMPLE_LINK,
                    label: {fr: 'Modifié par', en: 'Modified by'}
                },
                {
                    ...commonAttributeData,
                    id: 'modified_at',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.DATE,
                    label: {fr: 'Date de modification', en: 'Modification date'}
                },
                {
                    ...commonAttributeData,
                    id: 'login',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Login', en: 'Login'}
                },
                {
                    ...commonAttributeData,
                    id: 'password',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.ENCRYPTED,
                    label: {fr: 'Mot de passe', en: 'Password'}
                },
                {
                    ...commonAttributeData,
                    id: 'email',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Email', en: 'Email'}
                }
            ];

            for (const attribute of attributesToCreate) {
                // Check if attribute already exists
                const attributeFromDb = await attributeRepo.getAttributes({
                    params: {
                        filters: {
                            id: attribute.id
                        },
                        strictFilters: true,
                        withCount: false
                    },
                    ctx
                });

                // It already exists, move on
                if (attributeFromDb.list.length) {
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

            if (!(await dbService.collectionExists('core_edge_libraries_attributes'))) {
                await dbService.createCollection('core_edge_libraries_attributes', collectionTypes.EDGE);
            }

            if (!(await dbService.collectionExists('core_libraries'))) {
                await dbService.createCollection('core_libraries');

                await libraryRepo.createLibrary({
                    libData: {
                        id: 'users',
                        system: true,
                        label: {fr: 'Utilisateurs', en: 'Users'}
                    },
                    ctx
                });

                const salt = await bcrypt.genSalt(10);
                const adminPwd = await bcrypt.hash(config.server.admin.password, salt);

                await dbService.execute({
                    query: `INSERT {
                            _key: '1',
                            created_at: ${moment().unix()},
                            modified_at: ${moment().unix()},
                            created_by: '1',
                            modified_by: '1',
                            login: '${config.server.admin.login}',
                            password: '${adminPwd}',
                            email: '${config.server.admin.email}'
                        } IN users`,
                    ctx
                });
            }

            if (!(await dbService.collectionExists('core_values'))) {
                await dbService.createCollection('core_values');
            }

            if (!(await dbService.collectionExists('core_edge_values_links'))) {
                await dbService.createCollection('core_edge_values_links', collectionTypes.EDGE);
            }

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
        }
    };
}
