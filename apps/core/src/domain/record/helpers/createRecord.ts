// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {type IEventsManagerDomain} from '../../eventsManager/eventsManagerDomain';
import {type ILibraryPermissionDomain} from '../../permission/libraryPermissionDomain';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import dayjs from 'dayjs';
import {LibraryPermissionsActions} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {CORE_IN_CREATION_BY, type IRecord} from '../../../_types/record';
import PermissionError from '../../../errors/PermissionError';
import {type ICreateRecordValueError} from '../_types';
import {type IAutomationDomain} from '../../automation/automationDomain';
import {SyncAutomationRuleEventAction} from '../../../_types/automation';

export type IPreCreateRecordCallback = () => Promise<ICreateRecordValueError[]>;

export type CreateRecordHelper = (params: {library: string; ctx: IQueryInfos; active?: boolean}) => Promise<IRecord>;

interface IDeps {
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.permission.library': ILibraryPermissionDomain;
    'core.infra.record': IRecordRepo;
    'core.domain.automation': IAutomationDomain;
}

export default function ({
    'core.domain.eventsManager': eventsManager,
    'core.domain.permission.library': libraryPermissionDomain,
    'core.infra.record': recordRepo,
    'core.domain.automation': automationDomain,
}: IDeps): CreateRecordHelper {
    return async ({library, active, ctx}) => {
        const recordData = {
            created_at: dayjs().unix(),
            created_by: String(ctx.userId),
            modified_at: dayjs().unix(),
            modified_by: String(ctx.userId),
            active,
            ...(!active && {[CORE_IN_CREATION_BY]: String(ctx.userId)}),
        };

        const canCreate = await libraryPermissionDomain.getLibraryPermission({
            action: LibraryPermissionsActions.CREATE_RECORD,
            libraryId: library,
            ctx,
        });

        if (!canCreate) {
            throw new PermissionError(LibraryPermissionsActions.CREATE_RECORD);
        }

        const newRecord = await recordRepo.createRecord({libraryId: library, recordData, ctx});

        await automationDomain.triggerRules({
            event: {
                action: SyncAutomationRuleEventAction.RECORD_INIT,
                topic: {
                    library,
                    record: {
                        id: newRecord.id,
                        libraryId: library,
                    },
                },
            },
            synchronous: true,
            partialMatchOnEventTopic: true,
            ctx,
        });

        // await is necessary during importData(), otherwise it will generate a memory leak due to number of events incoming
        // important to send for indexation manager
        await eventsManager.sendDatabaseEvent<EventAction.RECORD_SAVE>(
            {
                action: EventAction.RECORD_SAVE,
                topic: {
                    library: newRecord.library,
                    record: {
                        id: newRecord.id,
                        libraryId: newRecord.library,
                    },
                },
                after: newRecord,
            },
            ctx,
        );

        return newRecord;
    };
}
