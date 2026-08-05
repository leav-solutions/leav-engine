import {ACTIVE_ATTRIBUTE_ID} from '_ui/constants';

export type RecordUpdateEventClassification =
    /** The record is currently displayed: its content may be stale. */
    | 'visibleRecordTouched'
    /** An unlisted record switched `active`: it appeared in or disappeared from the library's visible content. */
    | 'listContentMaybeChanged'
    /** An unlisted record changed without switching `active`: nothing displayed is affected. */
    | 'irrelevant';

export const classifyRecordUpdateEvent = ({
    recordId,
    updatedAttributeIds,
    visibleRecordIds,
}: {
    recordId: string;
    updatedAttributeIds: string[];
    visibleRecordIds: string[];
}): RecordUpdateEventClassification => {
    if (visibleRecordIds.includes(recordId)) {
        return 'visibleRecordTouched';
    }

    if (updatedAttributeIds.includes(ACTIVE_ATTRIBUTE_ID)) {
        return 'listContentMaybeChanged';
    }

    return 'irrelevant';
};
