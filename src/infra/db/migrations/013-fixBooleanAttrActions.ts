import {aql} from 'arangojs';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IDbService} from '../dbService';
import {AttributeFormats} from '../../../_types/attribute';
import {ILibrary} from '_types/library';
import {IAttribute} from '_types/attribute';

interface IDeps {
    config?: any;
    'core.infra.db.dbService'?: IDbService;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.library'?: ILibraryDomain;
}

export default function({
    'core.domain.attribute': attributeDomain = null,
    'core.infra.db.dbService': dbService = null,
    'core.domain.library': libraryDomain = null
}: IDeps) {
    return {
        async run(ctx) {
            const existingAttributes = await attributeDomain
                .getAttributes({params: {filters: {format: [AttributeFormats.BOOLEAN]}}, ctx})
                .catch(err => {
                    console.log(err.message);
                });

            const existingLibraries = await libraryDomain.getLibraries({ctx}).catch(err => {
                console.log(err.message);
            });

            const modifyAndRecordAttribute = async function(attribute: IAttribute) {
                if (!attribute || !attribute.id) {
                    return;
                }

                const saveValue = [
                    {
                        id: 'validateFormat',
                        is_system: true
                    },
                    {
                        id: 'toBoolean',
                        is_system: true
                    }
                ];

                const getValue = [];

                const actionsList = {getValue, saveValue};

                await dbService
                    .execute({
                        query: aql`UPDATE ${attribute.id} WITH {
                            actions_list: ${actionsList}
                        } IN core_attributes`,
                        ctx
                    })
                    .catch(err => {
                        console.log(err.message);
                    });
            };

            const modifyRecordsLibraries = async function(library: ILibrary) {
                if (!library || !library.id) {
                    return;
                }

                let booleanAttributes = [];
                if (library.attributes) {
                    booleanAttributes = library.attributes
                        .filter(a => a.format === AttributeFormats.BOOLEAN)
                        .map(a => a.id);
                }

                const collection = dbService.db.collection(library.id);
                let records = await dbService
                    .execute({
                        query: aql`FOR r IN ${collection} RETURN r`,
                        ctx
                    })
                    .catch(err => {
                        console.log(err.message);
                    });

                if (records) {
                    records = records.map(record => {
                        for (const [key, value] of Object.entries(record)) {
                            if (booleanAttributes.find(ea => ea === key) && typeof value === 'string') {
                                record[key] = value === 'true';
                            }
                        }

                        return record;
                    });

                    for (const record of records) {
                        await dbService
                            .execute({
                                query: aql`
                                    UPDATE ${record._key} 
                                    WITH ${record}
                                    IN ${collection}
                                    `,
                                ctx
                            })
                            .catch(err => {
                                console.log(err.message);
                            });
                    }
                }
            };

            if (existingAttributes) {
                existingAttributes.list.forEach(modifyAndRecordAttribute);
            }
            if (existingLibraries) {
                existingLibraries.list.forEach(modifyRecordsLibraries);
            }
        }
    };
}
