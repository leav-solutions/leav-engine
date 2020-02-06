import moment from 'moment';
import {IMigration} from '_types/migration';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {IAttributeRepo} from '../../attribute/attributeRepo';
import {ILibraryRepo} from '../../library/libraryRepo';
import {collectionTypes, IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.attribute'?: IAttributeRepo;
}

export default function({
    'core.infra.db.dbService': dbService = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.attribute': attributeRepo = null
}: IDeps = {}): IMigration {
    return {
        async run() {
            if (!(await dbService.collectionExists('core_attributes'))) {
                await dbService.createCollection('core_attributes');

                await attributeRepo.createAttribute({
                    id: 'id',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Identifiant', en: 'Identifier'}
                });

                await attributeRepo.createAttribute({
                    id: 'created_by',
                    linked_library: 'users',
                    system: true,
                    type: AttributeTypes.SIMPLE_LINK,
                    label: {fr: 'Créé par', en: 'Created by'}
                });

                await attributeRepo.createAttribute({
                    id: 'created_at',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {fr: 'Date de création', en: 'Creation date'},
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [
                            {
                                name: 'formatDate',
                                is_system: false
                            }
                        ],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                name: 'validateFormat',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });

                await attributeRepo.createAttribute({
                    id: 'modified_by',
                    linked_library: 'users',
                    system: true,
                    type: AttributeTypes.SIMPLE_LINK,
                    label: {fr: 'Modifié par', en: 'Modified by'}
                });

                await attributeRepo.createAttribute({
                    id: 'modified_at',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {fr: 'Date de modification', en: 'Modification date'},
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [
                            {
                                name: 'formatDate',
                                is_system: false
                            }
                        ],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                name: 'validateFormat',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });

                await attributeRepo.createAttribute({
                    id: 'login',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Login', en: 'Login'},
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                name: 'validateFormat',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });

                await attributeRepo.createAttribute({
                    id: 'password',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.ENCRYPTED,
                    label: {fr: 'Mot de passe', en: 'Password'},
                    actions_list: {
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                name: 'validateFormat',
                                is_system: true
                            },
                            {
                                name: 'encrypt',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.GET_VALUE]: [
                            {
                                name: 'maskValue',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });
            }

            if (!(await dbService.collectionExists('core_edge_libraries_attributes'))) {
                await dbService.createCollection('core_edge_libraries_attributes', collectionTypes.EDGE);
            }

            if (!(await dbService.collectionExists('core_libraries'))) {
                await dbService.createCollection('core_libraries');

                await libraryRepo.createLibrary({
                    id: 'users',
                    system: true,
                    label: {fr: 'Utilisateurs', en: 'Users'}
                });

                await dbService.execute(
                    `INSERT {
                        _key: '1',
                        created_at: ${moment().unix()},
                        modified_at: ${moment().unix()},
                        login: 'admin',
                        password: '$2b$10$5Xfl5NHANL9kingYuicNR.naIL23PnTqqZBJKmhhhzVlYjQFXTcya'
                    } IN users`
                );
            }

            if (!(await dbService.collectionExists('core_values'))) {
                await dbService.createCollection('core_values');
            }

            if (!(await dbService.collectionExists('core_edge_values_links'))) {
                await dbService.createCollection('core_edge_values_links', collectionTypes.EDGE);
            }

            // Save default attributes to users library
            await libraryRepo.saveLibraryAttributes('users', [
                'id',
                'created_by',
                'created_at',
                'modified_by',
                'modified_at',
                'login',
                'password'
            ]);
        }
    };
}
