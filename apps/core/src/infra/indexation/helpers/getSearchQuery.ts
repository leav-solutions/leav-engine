// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, literal, GeneratedAqlQuery, join} from 'arangojs/aql';
import {CORE_INDEX_VIEW, CORE_INDEX_FIELD, CORE_INDEX_ANALYZER} from '../indexationService';

export type GetSearchQuery = (libraryId: string, fields: string[], search: string) => GeneratedAqlQuery;

export default function (): GetSearchQuery {
    return (libraryId: string, fields: string[], search: string): GeneratedAqlQuery => {
        if (!fields.length) {
            return aql`[]`;
        }

        const queryParts = [aql`FOR doc IN ${literal(`${CORE_INDEX_VIEW}_${libraryId}`)} SEARCH`];
        const value = literal(`"%${search}%"`);

        for (const [i, field] of fields.entries()) {
            queryParts.push(
                aql`ANALYZER(doc.${CORE_INDEX_FIELD}.${field} LIKE TOKENS(${value}, ${CORE_INDEX_ANALYZER})[0], ${CORE_INDEX_ANALYZER})`
            );

            if (i < fields.length - 1) {
                queryParts.push(aql`OR`);
            }
        }

        queryParts.push(
            aql`RETURN MERGE(doc, {${CORE_INDEX_FIELD}: MERGE(doc.${CORE_INDEX_FIELD}, {score: BM25(doc)})})`
        );

        return join(queryParts, '\n');
    };
}
