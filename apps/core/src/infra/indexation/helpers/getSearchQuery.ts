import {type IRecordSort} from '../../../_types/record';
import {type GeneratedAqlQuery, aql, join, literal} from 'arangojs/aql';
import type * as Config from '../../../_types/config';
import {
    CORE_INDEX_ANALYZER,
    CORE_INDEX_FIELD,
    CORE_INDEX_INPUT_ANALYZER,
    CORE_INDEX_NGRAM_ANALYZER,
    CORE_INDEX_NGRAM_THRESHOLD,
    CORE_INDEX_VIEW,
} from '../indexationService';

export type GetSearchQuery = (
    libraryId: string,
    fields: string[],
    search: string,
    sort?: IRecordSort,
) => GeneratedAqlQuery;

interface IDeps {
    config?: Config.IConfig;
}

export default function ({config = null}: IDeps = {}): GetSearchQuery {
    return (libraryId: string, fields: string[], search: string, sort?: IRecordSort): GeneratedAqlQuery => {
        if (!fields.length) {
            return aql`[]`;
        }

        const fuzzySearchEnabled = config?.indexationManager?.fuzzySearch ?? true;

        const queryParts = [aql`FOR doc IN ${literal(`${CORE_INDEX_VIEW}_${libraryId}`)} SEARCH`];

        for (const [i, field] of fields.entries()) {
            const exactMatch = aql`ANALYZER(TOKENS(${search}, ${CORE_INDEX_INPUT_ANALYZER}) ALL IN doc.${CORE_INDEX_FIELD}.${field}, ${CORE_INDEX_ANALYZER})`;

            if (fuzzySearchEnabled) {
                queryParts.push(
                    aql`(${exactMatch}
                        OR NGRAM_MATCH(doc.${CORE_INDEX_FIELD}.${field}, ${search}, ${CORE_INDEX_NGRAM_THRESHOLD}, ${CORE_INDEX_NGRAM_ANALYZER}))`,
                );
            } else {
                queryParts.push(aql`(${exactMatch})`);
            }

            if (i < fields.length - 1) {
                queryParts.push(aql`OR`);
            }
        }

        // If no specific sort is provided, we sort by relevance and then by _key
        if (!sort) {
            queryParts.push(aql`SORT BM25(doc) DESC, TO_NUMBER(doc._key) DESC`);
        }

        queryParts.push(aql`RETURN MERGE(doc, {${CORE_INDEX_FIELD}: doc.${CORE_INDEX_FIELD}})`);

        return join(queryParts, '\n');
    };
}
