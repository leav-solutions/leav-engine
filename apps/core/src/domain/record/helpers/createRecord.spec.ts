import {type IAutomationDomain} from '../../automation/automationDomain';
import {type IEventsManagerDomain} from '../../eventsManager/eventsManagerDomain';
import {type ILibraryPermissionDomain} from '../../permission/libraryPermissionDomain';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {Errors} from '../../../_types/errors';
import ValidationError from '../../../errors/ValidationError';
import PermissionError from '../../../errors/PermissionError';
import createRecordHelper from './createRecord';

const VALID_UUID_V4 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const ctx: IQueryInfos = {userId: '1', queryId: 'create-record-test', lang: 'fr'};

const buildDeps = (
    overrides: {
        canCreate?: boolean;
        createdRecord?: Record<string, unknown>;
    } = {},
) => {
    const createdRecord = overrides.createdRecord ?? {id: '42', library: 'lib_test'};
    const recordRepo: Mockify<IRecordRepo> = {
        createRecord: vi.fn(async ({recordData}) => ({...createdRecord, ...recordData})),
    };
    const libraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
        getLibraryPermission: global.__mockPromise(overrides.canCreate ?? true),
    };
    const eventsManager: Mockify<IEventsManagerDomain> = {
        sendDatabaseEvent: global.__mockPromise(),
    };
    const automationDomain: Mockify<IAutomationDomain> = {
        triggerRules: global.__mockPromise(),
    };

    const deps = {
        'core.infra.record': recordRepo as IRecordRepo,
        'core.domain.permission.library': libraryPermissionDomain as ILibraryPermissionDomain,
        'core.domain.eventsManager': eventsManager as IEventsManagerDomain,
        'core.domain.automation': automationDomain as IAutomationDomain,
    };

    return {deps, recordRepo, libraryPermissionDomain};
};

describe('createRecord helper', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('generates a UUID v4 in recordData when uuid is not provided', async () => {
        const {deps, recordRepo} = buildDeps();
        const helper = createRecordHelper(deps);

        await helper({library: 'lib_test', ctx, active: false});

        expect(recordRepo.createRecord).toHaveBeenCalledTimes(1);
        const passed = recordRepo.createRecord.mock.calls[0][0].recordData;
        expect(passed.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    test('uses the provided uuid when it is a valid UUID v4', async () => {
        const {deps, recordRepo} = buildDeps();
        const helper = createRecordHelper(deps);

        await helper({library: 'lib_test', ctx, active: false, uuid: VALID_UUID_V4});

        const passed = recordRepo.createRecord.mock.calls[0][0].recordData;
        expect(passed.uuid).toBe(VALID_UUID_V4);
    });

    test('throws ValidationError when the provided uuid is invalid', async () => {
        const {deps, recordRepo} = buildDeps();
        const helper = createRecordHelper(deps);

        await expect(helper({library: 'lib_test', ctx, active: false, uuid: 'not-a-uuid'})).rejects.toThrow(
            ValidationError,
        );
        expect(recordRepo.createRecord).not.toHaveBeenCalled();
    });

    test('throws PermissionError when the user cannot create records', async () => {
        const {deps, recordRepo} = buildDeps({canCreate: false});
        const helper = createRecordHelper(deps);

        await expect(helper({library: 'lib_test', ctx, active: false})).rejects.toThrow(PermissionError);
        expect(recordRepo.createRecord).not.toHaveBeenCalled();
    });

    test('attaches the uuid via INVALID_UUID_FORMAT error key on validation failure', async () => {
        const {deps} = buildDeps();
        const helper = createRecordHelper(deps);

        await expect(helper({library: 'lib_test', ctx, active: false, uuid: ''})).rejects.toMatchObject({
            fields: {uuid: Errors.INVALID_UUID_FORMAT},
        });
    });
});
