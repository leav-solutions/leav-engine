// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IAttribute} from '_types/attribute';
import {ILibrary} from '_types/library';
import {AttributeFormats} from '../../../_types/attribute';
import {IDbService} from '../dbService';

interface IDeps {
    config?: any;
    'core.infra.db.dbService'?: IDbService;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.library'?: ILibraryDomain;
}

export default function ({
    'core.domain.attribute': attributeDomain = null,
    'core.infra.db.dbService': dbService = null,
    'core.domain.library': libraryDomain = null
}: IDeps) {
    return {
        async run(ctx) {
            const existingAttributes = await attributeDomain.getAttributes({
                params: {filters: {format: [AttributeFormats.EXTENDED]}},
                ctx
            });

            const existingLibraries = await libraryDomain.getLibraries({ctx});

            const modifyAndRecordAttribute = async function (attribute: IAttribute) {
                if (!attribute || !attribute.id) {
                    return;
                }

                const saveValue = [
                    {
                        is_system: true,
                        id: 'parseJSON',
                        name: 'Parse JSON'
                    },
                    {
                        is_system: true,
                        id: 'validateFormat',
                        name: 'Validate Format'
                    }
                ];

                const getValue = [
                    {
                        is_system: true,
                        id: 'toJSON',
                        name: 'To JSON'
                    }
                ];

                const actionsList = {getValue, saveValue};

                await dbService.execute({
                    query: aql`UPDATE ${attribute.id} WITH {
                            actions_list: ${actionsList}
                        } IN core_attributes`,
                    ctx
                });
            };

            const modifyRecordsLibraries = async function (library: ILibrary) {
                if (!library || !library.id) {
                    return;
                }

                let extendedAttributes = [];
                if (library.attributes) {
                    extendedAttributes = library.attributes
                        .filter(a => a.format === AttributeFormats.EXTENDED)
                        .map(a => a.id);
                }

                const collection = dbService.db.collection(library.id);
                let records = await dbService.execute({
                    query: aql`FOR r IN ${collection} RETURN r`,
                    ctx
                });

                if (records) {
                    records = records.map(record => {
                        for (const [key, value] of Object.entries(record)) {
                            if (extendedAttributes.find(ea => ea === key) && typeof value === 'string') {
                                record[key] = JSON.parse(value as string);
                            }
                        }

                        return record;
                    });

                    for (const record of records) {
                        await dbService.execute({
                            query: aql`
                                    UPDATE ${record._key}
                                    WITH ${record}
                                    IN ${collection}
                                    `,
                            ctx
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
