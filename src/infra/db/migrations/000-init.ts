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
        async run(ctx) {
            if (!(await dbService.collectionExists('core_attributes'))) {
                await dbService.createCollection('core_attributes');

                await attributeRepo.createAttribute({
                    attrData: {
                        id: 'id',
                        system: true,
                        type: AttributeTypes.SIMPLE,
                        format: AttributeFormats.TEXT,
                        label: {fr: 'Identifiant', en: 'Identifier'},
                        multiple_values: false
                    },
                    ctx
                });

                await attributeRepo.createAttribute({
                    attrData: {
                        id: 'created_by',
                        linked_library: 'users',
                        system: true,
                        type: AttributeTypes.SIMPLE_LINK,
                        label: {fr: 'Créé par', en: 'Created by'},
                        multiple_values: false
                    },
                    ctx
                });

                await attributeRepo.createAttribute({
                    attrData: {
                        id: 'created_at',
                        system: true,
                        type: AttributeTypes.SIMPLE,
                        format: AttributeFormats.NUMERIC,
                        label: {fr: 'Date de création', en: 'Creation date'},
                        multiple_values: false,
                        actions_list: {
                            [ActionsListEvents.GET_VALUE]: [
                                {
                                    id: 'formatDate',
                                    name: 'Format Date',
                                    is_system: false
                                }
                            ],
                            [ActionsListEvents.SAVE_VALUE]: [
                                {
                                    id: 'validateFormat',
                                    name: 'Validate Format',
                                    is_system: true
                                }
                            ],
                            [ActionsListEvents.DELETE_VALUE]: []
                        }
                    },
                    ctx
                });

                await attributeRepo.createAttribute({
                    attrData: {
                        id: 'modified_by',
                        linked_library: 'users',
                        system: true,
                        type: AttributeTypes.SIMPLE_LINK,
                        label: {fr: 'Modifié par', en: 'Modified by'},
                        multiple_values: false
                    },
                    ctx
                });

                await attributeRepo.createAttribute({
                    attrData: {
                        id: 'modified_at',
                        system: true,
                        type: AttributeTypes.SIMPLE,
                        format: AttributeFormats.NUMERIC,
                        label: {fr: 'Date de modification', en: 'Modification date'},
                        actions_list: {
                            [ActionsListEvents.GET_VALUE]: [
                                {
                                    id: 'formatDate',
                                    name: 'Format Date',
                                    is_system: false
                                }
                            ],
                            [ActionsListEvents.SAVE_VALUE]: [
                                {
                                    id: 'validateFormat',
                                    name: 'Validate Format',
                                    is_system: true
                                }
                            ],
                            [ActionsListEvents.DELETE_VALUE]: []
                        },
                        multiple_values: false
                    },
                    ctx
                });

                await attributeRepo.createAttribute({
                    attrData: {
                        id: 'login',
                        system: true,
                        type: AttributeTypes.SIMPLE,
                        format: AttributeFormats.TEXT,
                        label: {fr: 'Login', en: 'Login'},
                        actions_list: {
                            [ActionsListEvents.GET_VALUE]: [],
                            [ActionsListEvents.SAVE_VALUE]: [
                                {
                                    id: 'validateFormat',
                                    name: 'Validate Format',
                                    is_system: true
                                }
                            ],
                            [ActionsListEvents.DELETE_VALUE]: []
                        },
                        multiple_values: false
                    },
                    ctx
                });

                await attributeRepo.createAttribute({
                    attrData: {
                        id: 'password',
                        system: true,
                        type: AttributeTypes.SIMPLE,
                        format: AttributeFormats.ENCRYPTED,
                        label: {fr: 'Mot de passe', en: 'Password'},
                        actions_list: {
                            [ActionsListEvents.SAVE_VALUE]: [
                                {
                                    id: 'validateFormat',
                                    name: 'Validate Format',
                                    is_system: true
                                },
                                {
                                    id: 'encrypt',
                                    name: 'Encrypt',
                                    is_system: true
                                }
                            ],
                            [ActionsListEvents.GET_VALUE]: [
                                {
                                    id: 'maskValue',
                                    name: 'Mask Value',
                                    is_system: true
                                }
                            ],
                            [ActionsListEvents.DELETE_VALUE]: []
                        },
                        multiple_values: false
                    },
                    ctx
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

                await dbService.execute({
                    query: `INSERT {
                            _key: '1',
                            created_at: ${moment().unix()},
                            modified_at: ${moment().unix()},
                            login: 'admin',
                            password: '$2b$10$5Xfl5NHANL9kingYuicNR.naIL23PnTqqZBJKmhhhzVlYjQFXTcya'
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
                attributes: ['id', 'created_by', 'created_at', 'modified_by', 'modified_at', 'login', 'password'],
                ctx
            });
        }
    };
}
