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
import {UUID_ATTRIBUTE_ID} from '../../../_constants/attributes';
import {isValidUuidV4} from '../../../utils/helpers/validateUuid';
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
        if (uuid !== undefined && !isValidUuidV4(uuid)) {
            throw new ValidationError<{uuid: string}>({[UUID_ATTRIBUTE_ID]: Errors.INVALID_UUID_FORMAT});
        }

        const recordData = {
            [UUID_ATTRIBUTE_ID]: uuid ?? randomUUID(),
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
