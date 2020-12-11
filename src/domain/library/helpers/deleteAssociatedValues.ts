import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IQueryInfos} from '_types/queryInfos';

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.value'?: IValueDomain;
}

export interface IDeleteAssociatedValuesHelper {
    deleteAssociatedValues: (attributes: string[], libraryId: string, ctx: IQueryInfos) => Promise<void>;
}

export default function({
    'core.domain.record': recordDomain = null,
    'core.domain.value': valueDomain = null
}: IDeps): IDeleteAssociatedValuesHelper {
    return {
        async deleteAssociatedValues(attributes: string[], libraryId: string, ctx: IQueryInfos): Promise<void> {
            const records = await recordDomain.find({params: {library: libraryId}, ctx});
            for (const r of records.list) {
                for (const a of attributes) {
                    await valueDomain.deleteValue({
                        library: libraryId,
                        recordId: r.id,
                        attribute: a,
                        ctx
                    });
                }
            }
        }
    };
}
