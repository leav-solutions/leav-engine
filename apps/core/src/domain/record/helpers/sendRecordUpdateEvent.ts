import {type IEventsManagerDomain} from '../../eventsManager/eventsManagerDomain';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IRecord, type IRecordUpdateEvent} from '../../../_types/record';
import {TriggerNames} from '../../../_types/eventsManager';

type RequiredOnField<T, F extends keyof T> = Required<Pick<T, F>> & Omit<T, F>;

export const isRecordWithId = (record: IRecord): record is RequiredOnField<IRecord, 'id'> => 'id' in record;

export type SendRecordUpdateEventHelper = (
    record: IRecord,
    updatedValues: IRecordUpdateEvent['updatedValues'],
    ctx: IQueryInfos,
) => void;

interface IDeps {
    'core.domain.eventsManager': IEventsManagerDomain;
}

export default function ({'core.domain.eventsManager': eventsManagerDomain}: IDeps): SendRecordUpdateEventHelper {
    return async (record, updatedValues, ctx) => {
        await eventsManagerDomain.sendPubSubEvent(
            {
                triggerName: TriggerNames.RECORD_UPDATE,
                data: {recordUpdate: {record, updatedValues}},
            },
            ctx,
        );
    };
}
