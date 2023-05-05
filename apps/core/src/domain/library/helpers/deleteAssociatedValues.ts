// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeTypes} from '../../../_types/attribute';
import {IValueRepo} from 'infra/value/valueRepo';
import {IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.value'?: IValueRepo;
}

export interface IDeleteAssociatedValuesHelper {
    deleteAssociatedValues: (attributes: string[], libraryId: string, ctx: IQueryInfos) => Promise<void>;
}

export default function ({
    'core.domain.record': recordDomain = null,
    'core.domain.value': valueDomain = null,
    'core.infra.value': valueRepo = null,
    'core.domain.attribute': attributeDomain = null
}: IDeps): IDeleteAssociatedValuesHelper {
    return {
        async deleteAssociatedValues(attributes: string[], libraryId: string, ctx: IQueryInfos): Promise<void> {
            const records = await recordDomain.find({params: {library: libraryId}, ctx});
            const attributesWithProps = await Promise.all(
                attributes.map(async a => attributeDomain.getAttributeProperties({id: a, ctx}))
            );

            for (const r of records.list) {
                for (const a of attributesWithProps) {
                    if (
                        !a.reverse_link &&
                        (a.type === AttributeTypes.ADVANCED ||
                            a.type === AttributeTypes.ADVANCED_LINK ||
                            a.type === AttributeTypes.TREE)
                    ) {
                        const values = await valueRepo.getValues({
                            library: libraryId,
                            recordId: r.id,
                            attribute: a as IAttributeWithRevLink,
                            options: {forceGetAllValues: true, forceArray: true},
                            ctx
                        });

                        for (const v of values) {
                            await valueDomain.deleteValue({
                                library: libraryId,
                                recordId: r.id,
                                attribute: a.id,
                                value: v,
                                ctx
                            });
                        }
                    } else {
                        await valueDomain.deleteValue({
                            library: libraryId,
                            recordId: r.id,
                            attribute: a.id,
                            ctx
                        });
                    }
                }
            }
        }
    };
}
