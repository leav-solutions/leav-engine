import {aql} from 'arangojs';
import {type ISDO} from '../../../_types/sdo';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IDbDocument} from '../../db/_types';
import {type IDbService} from '../../db/dbService';

export const RECORDS_SDO_COLLECTION_NAME = 'core_records_sdo';

type IRecordSDOBaseDocument = {
    libraryId: string;
    recordId: string;
    content: ISDO['content'];
};

type IRecordSDODbDocument = IRecordSDOBaseDocument & IDbDocument;

export interface IRecordSDORepo {
    /**
     * Return the stored SDO content for a record, or null if none.
     */
    getContent({recordUUID, ctx}: {recordUUID: string; ctx: IQueryInfos}): Promise<ISDO['content'] | null>;

    /**
     * Create or update the SDO content document for a record.
     */
    upsertContent({
        recordUUID,
        libraryId,
        recordId,
        content,
        ctx,
    }: {
        recordUUID: string;
        libraryId: string;
        recordId: string;
        content: ISDO['content'];
        ctx: IQueryInfos;
    }): Promise<void>;

    /**
     * Delete the SDO content document for a record. No-op if it doesn't exist.
     */
    deleteContent({recordUUID, ctx}: {recordUUID: string; ctx: IQueryInfos}): Promise<void>;
}

export interface IRecordSDORepoDeps {
    'core.infra.db.dbService': IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IRecordSDORepoDeps): IRecordSDORepo {
    return {
        async getContent({recordUUID, ctx}) {
            const collection = dbService.db.collection(RECORDS_SDO_COLLECTION_NAME);

            const res = await dbService.execute<IRecordSDODbDocument[]>({
                query: aql`
                    FOR d IN ${collection}
                        FILTER d._key == ${recordUUID}
                        LIMIT 1
                        RETURN d
                `,
                ctx,
            });

            return res[0]?.content ?? null;
        },
        async upsertContent({recordUUID, libraryId, recordId, content, ctx}) {
            const collection = dbService.db.collection(RECORDS_SDO_COLLECTION_NAME);
            const document: Omit<IRecordSDODbDocument, '_id' | '_rev'> = {
                _key: recordUUID,
                libraryId,
                recordId,
                content,
            };

            await dbService.execute({
                query: aql`
                    UPSERT {_key: ${recordUUID}}
                        INSERT ${document}
                        UPDATE {content: ${content}}
                        IN ${collection}
                `,
                ctx,
            });
        },
        async deleteContent({recordUUID, ctx}) {
            const collection = dbService.db.collection(RECORDS_SDO_COLLECTION_NAME);

            await dbService.execute({
                query: aql`
                    FOR d IN ${collection}
                        FILTER d._key == ${recordUUID}
                        REMOVE d IN ${collection}
                `,
                ctx,
            });
        },
    };
}
