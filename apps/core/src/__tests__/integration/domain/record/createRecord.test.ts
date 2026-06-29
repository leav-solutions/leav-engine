import {systemUserId} from '../../../../_constants/users';
import {type ILibraryDomain} from '../../../../domain/library/libraryDomain';
import {type IRecordDomain} from '../../../../domain/record/recordDomain';
import {type IValueDomain} from '../../../../domain/value/valueDomain';
import {ErrorTypes} from '../../../../_types/errors';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {getCoreDep} from '../../integrationTestUtils';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_UUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const libraryId = 'create_record_uuid_test_lib';

describe('create record (uuid system attribute)', () => {
    let recordDomain: IRecordDomain;
    let libraryDomain: ILibraryDomain;
    let valueDomain: IValueDomain;
    const ctx: IQueryInfos = {userId: systemUserId};

    describe('UUID system attribute', () => {
        beforeAll(async () => {
            recordDomain = getCoreDep<IRecordDomain>('core.domain.record');
            libraryDomain = getCoreDep<ILibraryDomain>('core.domain.library');
            valueDomain = getCoreDep<IValueDomain>('core.domain.value');

            await libraryDomain.saveLibrary({id: libraryId}, ctx);
        });

        test('generates a UUID when none is provided', async () => {
            const {record, valuesErrors} = await recordDomain.createRecord({library: libraryId, ctx});

            expect(valuesErrors).toBeNull();
            expect(record).not.toBeNull();
            expect(record.uuid).toMatch(UUID_REGEX);
        });

        test('uses the provided uuid when it has a valid UUID format', async () => {
            const {record, valuesErrors} = await recordDomain.createRecord({library: libraryId, uuid: VALID_UUID, ctx});

            expect(valuesErrors).toBeNull();
            expect(record.uuid).toBe(VALID_UUID);
        });

        test('returns a VALIDATION_ERROR result when the provided uuid is malformed', async () => {
            const {record, valuesErrors} = await recordDomain.createRecord({
                library: libraryId,
                uuid: 'not-a-uuid',
                ctx,
            });

            expect(record).toBeNull();
            expect(valuesErrors).toEqual([expect.objectContaining({type: ErrorTypes.VALIDATION_ERROR})]);
        });
    });
});
