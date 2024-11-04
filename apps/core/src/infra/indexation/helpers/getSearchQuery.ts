// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordSort} from '_types/record';
import {GeneratedAqlQuery, aql, join, literal} from 'arangojs/aql';
import {CORE_INDEX_ANALYZER, CORE_INDEX_FIELD, CORE_INDEX_INPUT_ANALYZER, CORE_INDEX_VIEW} from '../indexationService';

export type GetSearchQuery = (
    libraryId: string,
    fields: string[],
    search: string,
    sort?: IRecordSort
) => GeneratedAqlQuery;

export default function (): GetSearchQuery {
    return (libraryId: string, fields: string[], search: string, sort?: IRecordSort): GeneratedAqlQuery => {
        if (!fields.length) {
            return aql`[]`;
        }

        const queryParts = [aql`FOR doc IN ${literal(`${CORE_INDEX_VIEW}_${libraryId}`)} SEARCH`];

        for (const [i, field] of fields.entries()) {
            queryParts.push(
                aql`ANALYZER(TOKENS(${search}, ${CORE_INDEX_INPUT_ANALYZER}) ALL IN doc.${CORE_INDEX_FIELD}.${field}, ${CORE_INDEX_ANALYZER})`
            );

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
