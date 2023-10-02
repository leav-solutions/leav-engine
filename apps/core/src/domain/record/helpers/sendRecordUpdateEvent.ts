// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IQueryInfos} from '_types/queryInfos';
import {IRecord, IRecordUpdateEvent} from '_types/record';
import {TriggerNames} from '../../../_types/eventsManager';

export type SendRecordUpdateEventHelper = (
    record: IRecord,
    updatedValues: IRecordUpdateEvent['updatedValues'],
    ctx: IQueryInfos
) => Promise<void>;

interface IDeps {
    'core.domain.eventsManager'?: IEventsManagerDomain;
}

export default function ({
    'core.domain.eventsManager': eventsManagerDomain = null
}: IDeps): SendRecordUpdateEventHelper {
    return async (record, updatedValues, ctx) => {
        await eventsManagerDomain.sendPubSubEvent(
            {
                triggerName: TriggerNames.RECORD_UPDATE,
                data: {recordUpdate: {record, updatedValues}}
            },
            ctx
        );
    };
}
