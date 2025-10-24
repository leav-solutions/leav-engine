// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type ILibraryPermissionDomain} from 'domain/permission/libraryPermissionDomain';
import {type IRecordRepo} from 'infra/record/recordRepo';
import moment from 'moment';
import {LibraryPermissionsActions} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {CORE_IN_CREATION_BY, type IRecord} from '../../../_types/record';
import PermissionError from '../../../errors/PermissionError';
import {type ICreateRecordValueError} from '../_types';

export type IPreCreateRecordCallback = () => Promise<ICreateRecordValueError[]>;

export type CreateRecordHelper = (params: {library: string; ctx: IQueryInfos; active?: boolean}) => Promise<IRecord>;

interface IDeps {
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.permission.library': ILibraryPermissionDomain;
    'core.infra.record': IRecordRepo;
}

export default function ({
    'core.domain.eventsManager': eventsManager,
    'core.domain.permission.library': libraryPermissionDomain,
    'core.infra.record': recordRepo
}: IDeps): CreateRecordHelper {
    return async ({library, active, ctx}) => {
        const recordData = {
            created_at: moment().unix(),
            created_by: String(ctx.userId),
            modified_at: moment().unix(),
            modified_by: String(ctx.userId),
            active,
            ...(!active && {[CORE_IN_CREATION_BY]: String(ctx.userId)})
        };

        const canCreate = await libraryPermissionDomain.getLibraryPermission({
            action: LibraryPermissionsActions.CREATE_RECORD,
            userId: ctx.userId,
            libraryId: library,
            ctx
        });

        if (!canCreate) {
            throw new PermissionError(LibraryPermissionsActions.CREATE_RECORD);
        }

        const newRecord = await recordRepo.createRecord({libraryId: library, recordData, ctx});

        // await is necessary during importData(), otherwise it will generate a memory leak due to number of events incoming
        // important to send for indexation manager
        await eventsManager.sendDatabaseEvent<EventAction.RECORD_SAVE>(
            {
                action: EventAction.RECORD_SAVE,
                topic: {
                    record: {
                        id: newRecord.id,
                        libraryId: newRecord.library
                    }
                },
                after: newRecord
            },
            ctx
        );

        return newRecord;
    };
}
