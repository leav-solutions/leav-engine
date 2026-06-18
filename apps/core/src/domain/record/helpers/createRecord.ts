import {CommonAttributes} from '../../../_constants/systemAttributes';
import {EventAction} from '@leav/utils';
import {randomUUID} from 'crypto';
import {type IEventsManagerDomain} from '../../eventsManager/eventsManagerDomain';
import {type ILibraryPermissionDomain} from '../../permission/libraryPermissionDomain';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import dayjs from 'dayjs';
import {LibraryPermissionsActions} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {CORE_IN_CREATION_BY, type IRecord} from '../../../_types/record';
import PermissionError from '../../../errors/PermissionError';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';
import {isValidUuid} from '../../../utils/helpers/validateUuid';
import {type ICreateRecordValueError} from '../_types';
import {type IAutomationDomain} from '../../automation/automationDomain';
import {SyncAutomationRuleEventAction} from '../../../_types/automation';

export type IPreCreateRecordCallback = () => Promise<ICreateRecordValueError[]>;

export type CreateRecordHelper = (params: {
    library: string;
    ctx: IQueryInfos;
    active?: boolean;
    uuid?: string;
}) => Promise<IRecord>;

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
    return async ({library, active, ctx, uuid}) => {
        if (uuid !== undefined && !isValidUuid(uuid)) {
            throw new ValidationError<{uuid: string}>({[CommonAttributes.UUID]: Errors.INVALID_UUID_FORMAT});
        }

        const recordData = {
            [CommonAttributes.UUID]: uuid ?? randomUUID(),
            [CommonAttributes.CREATED_AT]: dayjs().unix(),
            [CommonAttributes.CREATED_BY]: String(ctx.userId),
            [CommonAttributes.MODIFIED_AT]: dayjs().unix(),
            [CommonAttributes.MODIFIED_BY]: String(ctx.userId),
            [CommonAttributes.ACTIVE]: active,
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
            ctx,
        });

        return newRecord;
    };
}
