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

        // Recomputed outside BM25: when matched words are common library-wide, their IDF collapses to
        // ~0, so BM25 can't rank an exact match above a fuzzy one. "_"-prefixed so dbUtils.cleanup
        // strips it, but callers with their own outer SORT (recordRepo.find()) can still read it.
        const exactMatchChecks = fields.map(
            field =>
                aql`(TOKENS(${search}, ${CORE_INDEX_INPUT_ANALYZER}) ALL IN TOKENS(doc.${CORE_INDEX_FIELD}.${field}, ${CORE_INDEX_ANALYZER}))`,
        );
        const isExactMatch = join(
            exactMatchChecks.flatMap((check, i) => (i > 0 ? [aql`OR`, check] : [check])),
            ' ',
        );

        queryParts.push(aql`LET _relevanceExactMatch = (${isExactMatch})`);
        queryParts.push(aql`LET _relevanceScore = BM25(doc)`);
        // Rounded variant for callers with their own explicit sort (recordRepo.find()): a raw BM25
        // float almost never ties between two documents, which would leave their sort no room to
        // apply. Not used in our own SORT below, which needs BM25's fine-grained fuzzy-match ordering.
        queryParts.push(aql`LET _relevanceScoreGroup = ROUND(_relevanceScore)`);

        // If no specific sort is provided, rank exact matches first, then by relevance, then by _key.
        if (!sort) {
            queryParts.push(aql`SORT _relevanceExactMatch DESC, _relevanceScore DESC, TO_NUMBER(doc._key) DESC`);
        }

        queryParts.push(
            aql`RETURN MERGE(doc, {${CORE_INDEX_FIELD}: doc.${CORE_INDEX_FIELD}, _relevanceExactMatch, _relevanceScore, _relevanceScoreGroup})`,
        );

        return join(queryParts, '\n');
    };
}
