// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {ILibraryPermissionDomain} from 'domain/permission/libraryPermissionDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import moment from 'moment';
import {LibraryPermissionsActions} from '../../../_types/permissions';
import {IQueryInfos} from '../../../_types/queryInfos';
import {IRecord} from '../../../_types/record';
import PermissionError from '../../../errors/PermissionError';
import {ICreateRecordResult, ICreateRecordValueError} from '../_types';

export type IPreCreateRecordCallback = () => Promise<ICreateRecordValueError[]>;

export type CreateRecordHelper = (params: {
        library: string;
        /**
         * Can be use to validate potential values to post create insert to record
         */
        preCreateCallback?: IPreCreateRecordCallback;
        ctx: IQueryInfos;
    }) => Promise<ICreateRecordResult>;

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

    return async ({library, preCreateCallback, ctx}) => {
        const recordData = {
            created_at: moment().unix(),
            created_by: String(ctx.userId),
            modified_at: moment().unix(),
            modified_by: String(ctx.userId),
            active: true
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

        const valuesErrors = await preCreateCallback?.();
        if (valuesErrors?.length) {
            return {
                record: null,
                valuesErrors
            };
        }

        const newRecord = await recordRepo.createRecord({libraryId: library, recordData, ctx});

        // await is necessary during importData(), otherwise it will generate a memory leak due to number of events incoming
        // important to send for indexation manager
        await eventsManager.sendDatabaseEvent(
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

        return {
            record: newRecord,
            valuesErrors: []
        };
    };
}
