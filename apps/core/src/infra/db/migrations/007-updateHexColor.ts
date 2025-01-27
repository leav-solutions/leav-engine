// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IDbService} from '../dbService';
import {type IMigration} from '../../../_types/migration';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {aql} from 'arangojs';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {AttributeFormats} from '../../../_types/attribute';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.attribute'?: IAttributeRepo;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.attribute': attributeRepo = null
}: IDeps = {}): IMigration {
    const _isValueHexColorWithoutPrefix = (value: string): boolean => /^[0-9A-Fa-f]{6}$/.test(value);

    const _addHexPrefix = async (ctx: IQueryInfos): Promise<void> => {
        const colorAttributes = await attributeRepo.getAttributes({
            params: {
                filters: {
                    format: [AttributeFormats.COLOR]
                }
            },
            ctx
        });

        const colorAttributesIds = colorAttributes.list.map(attribute => attribute.id);

        const librariesIdsUsingColorAttributes = new Set(
            (
                await Promise.all(
                    colorAttributesIds.map(async colorAttributeId => {
                        const libraries = await attributeRepo.getAttributeLibraries({
                            attributeId: colorAttributeId,
                            ctx
                        });
                        return libraries.map(library => library.id);
                    })
                )
            ).flat()
        );

        for (const libraryId of librariesIdsUsingColorAttributes) {
            const libraryCollection = dbService.db.collection(libraryId);
            const records = await dbService.execute({
                query: aql`
                        FOR record IN ${libraryCollection}
                            RETURN record
                    `,
                ctx
            });

            for (const record of records) {
                for (const colorAttributeId of colorAttributesIds) {
                    if (_isValueHexColorWithoutPrefix(record[colorAttributeId])) {
                        await dbService.execute({
                            query: aql`
                                UPDATE ${record._key} WITH {
                                    ${colorAttributeId}: CONCAT('#', ${record[colorAttributeId]})
                                } IN ${libraryCollection}
                            `,
                            ctx
                        });
                    }
                }
            }
        }

        const linkedValues = await dbService.execute({
            query: {
                query: `
                    FOR link IN core_edge_values_links
                        FILTER link.attribute IN @colorAttributesIds
                        RETURN link
                `,
                bindVars: {colorAttributesIds}
            },
            ctx
        });

        for (const linkedValue of linkedValues) {
            const result = await dbService.execute({
                query: aql`
                        FOR value IN core_values
                            FILTER value._id == ${linkedValue._to}
                            RETURN value
                    `,
                ctx
            });

            const record = result?.[0] || null;

            if (!record || !_isValueHexColorWithoutPrefix(record.value)) {
                continue;
            }

            await dbService.execute({
                query: aql`
                    UPDATE ${record._key} WITH {
                        value: CONCAT('#', ${record.value})
                    } IN 'core_values'
                `,
                ctx
            });
        }
    };

    return {
        run: _addHexPrefix
    };
}
