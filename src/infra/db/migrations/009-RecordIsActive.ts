import {aql} from 'arangojs';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IMigration} from '_types/migration';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {IDbService} from '../dbService';

interface IDeps {
    config?: any;
    'core.infra.db.dbService'?: IDbService;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.library'?: ILibraryRepo;
}

export default function({
    'core.infra.attribute': attributeRepo = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.infra.db.dbService': dbService = null
}: IDeps): IMigration {
    return {
        async run() {
            // Create "active" attribute
            const existingAttribute = await attributeDomain.getAttributes({filters: {id: 'active'}});

            if (!existingAttribute.list.length) {
                await attributeRepo.createAttribute({
                    id: 'active',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.BOOLEAN,
                    label: {fr: 'Actif', en: 'Active'},
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [
                            {
                                id: 'toBoolean',
                                name: 'To Boolean',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            },
                            {
                                id: 'toBoolean',
                                name: 'To Boolean',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });
            }

            // Bind it to every libraries
            const libraries = await libraryDomain.getLibraries();
            const libAttribCollec = dbService.db.edgeCollection('core_edge_libraries_attributes');

            for (const lib of libraries.list) {
                // Bind attribute to lib
                await dbService.execute(aql`
                    LET attrToInsert = {
                        _from: ${'core_libraries/' + lib.id},
                        _to: CONCAT('core_attributes/active')
                    }
                    UPSERT {
                        _from: ${'core_libraries/' + lib.id},
                        _to: CONCAT('core_attributes/active')
                    }
                    INSERT attrToInsert
                    UPDATE attrToInsert
                    IN ${libAttribCollec}
                    RETURN NEW
                `);

                // Set it to true for all records
                const recordsCollec = dbService.db.collection(lib.id);
                await dbService.execute(aql`
                    FOR r in ${recordsCollec}
                        FILTER r.active == null
                        UPDATE r WITH {active: true} IN ${recordsCollec}
                        RETURN NEW
                `);
            }
        }
    };
}
