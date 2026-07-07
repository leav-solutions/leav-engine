import {systemUserId} from '../../../../_constants/users';
import {type ILibraryDomain} from '../../../../domain/library/libraryDomain';
import {type IRecordDomain} from '../../../../domain/record/recordDomain';
import {type IRecordSDORepo} from '../../../../infra/sdo/recordsSDORepo/recordSDORepo';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {type ISDO} from '../../../../_types/sdo';
import {getCoreDep} from '../../integrationTestUtils';

const libraryId = 'delete_record_sdo_test_lib';

describe('deleteRecord (SDO content purge)', () => {
    let recordDomain: IRecordDomain;
    let libraryDomain: ILibraryDomain;
    let recordSDORepo: IRecordSDORepo;
    const ctx: IQueryInfos = {userId: systemUserId};

    beforeAll(async () => {
        recordDomain = getCoreDep<IRecordDomain>('core.domain.record');
        libraryDomain = getCoreDep<ILibraryDomain>('core.domain.library');
        recordSDORepo = getCoreDep<IRecordSDORepo>('core.infra.sdo.recordsSDORepo');

        await libraryDomain.saveLibrary({id: libraryId}, ctx);
    });

    test('purges the SDO content document when the record is deleted', async () => {
        const {record} = await recordDomain.createRecord({library: libraryId, ctx});
        const content = {system: {systemId: record.uuid}} as unknown as ISDO['content'];

        await recordSDORepo.upsertContent({
            recordUUID: record.uuid,
            libraryId,
            recordId: record.id,
            content,
            ctx,
        });

        expect(await recordSDORepo.getContent({recordUUID: record.uuid, ctx})).toEqual(content);

        await recordDomain.deleteRecord({library: libraryId, id: record.id, ctx});

        expect(await recordSDORepo.getContent({recordUUID: record.uuid, ctx})).toBeNull();
    });

    test('is a no-op when the record was never exported (no content document)', async () => {
        const {record} = await recordDomain.createRecord({library: libraryId, ctx});

        expect(await recordSDORepo.getContent({recordUUID: record.uuid, ctx})).toBeNull();

        await expect(recordDomain.deleteRecord({library: libraryId, id: record.id, ctx})).resolves.not.toThrow();
    });
});
