import {ACTIVE_ATTRIBUTE_ID} from '_ui/constants';
import {classifyRecordUpdateEvent} from './classifyRecordUpdateEvent';

describe('classifyRecordUpdateEvent', () => {
    it('classifies an event on a displayed record as visibleRecordTouched', () => {
        const classification = classifyRecordUpdateEvent({
            recordId: 'r1',
            updatedAttributeIds: ['title'],
            visibleRecordIds: ['r1', 'r2'],
        });

        expect(classification).toBe('visibleRecordTouched');
    });

    it('keeps visibleRecordTouched precedence when a displayed record switches active', () => {
        // a displayed record being (de)activated is still a change of a displayed record
        const classification = classifyRecordUpdateEvent({
            recordId: 'r1',
            updatedAttributeIds: [ACTIVE_ATTRIBUTE_ID],
            visibleRecordIds: ['r1'],
        });

        expect(classification).toBe('visibleRecordTouched');
    });

    it('classifies an active switch on an unlisted record as listContentMaybeChanged', () => {
        // typical creation flow: the record is activated as the last step of a creation form
        const classification = classifyRecordUpdateEvent({
            recordId: 'freshly-created',
            updatedAttributeIds: [ACTIVE_ATTRIBUTE_ID],
            visibleRecordIds: ['r1', 'r2'],
        });

        expect(classification).toBe('listContentMaybeChanged');
    });

    it('classifies a plain edit on an unlisted record as irrelevant', () => {
        // e.g. a record on another page: nothing displayed is affected
        const classification = classifyRecordUpdateEvent({
            recordId: 'record-on-another-page',
            updatedAttributeIds: ['title'],
            visibleRecordIds: ['r1', 'r2'],
        });

        expect(classification).toBe('irrelevant');
    });
});
