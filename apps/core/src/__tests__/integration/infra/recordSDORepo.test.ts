import crypto from 'crypto';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type ISDO} from '../../../_types/sdo';
import {type IRecordSDORepo} from '../../../infra/sdo/recordsSDORepo/recordSDORepo';
import {getRecordSDORepo} from './integrationTestRepoUtils';

describe('recordSDORepo', () => {
    let recordSDORepo: IRecordSDORepo;
    const ctx: IQueryInfos = {userId: '1'};

    beforeAll(async () => {
        recordSDORepo = getRecordSDORepo();
    });

    describe('getContent', () => {
        it('should return null when no content is stored for the record', async () => {
            const recordUUID = crypto.randomUUID();

            expect(await recordSDORepo.getContent({recordUUID, ctx})).toBeNull();
        });
    });

    describe('upsertContent', () => {
        it('should create the content document on first upsert', async () => {
            const recordUUID = crypto.randomUUID();
            const content = {system: {systemId: recordUUID}, info: {value: 'v1'}} as unknown as ISDO['content'];

            await recordSDORepo.upsertContent({
                recordUUID,
                libraryId: 'test_library',
                recordId: 'test_record',
                content,
                ctx,
            });

            expect(await recordSDORepo.getContent({recordUUID, ctx})).toEqual(content);
        });

        it('should update the content on a subsequent upsert for the same record', async () => {
            const recordUUID = crypto.randomUUID();
            const contentV1 = {system: {systemId: recordUUID}, info: {value: 'v1'}} as unknown as ISDO['content'];
            const contentV2 = {system: {systemId: recordUUID}, info: {value: 'v2'}} as unknown as ISDO['content'];

            await recordSDORepo.upsertContent({
                recordUUID,
                libraryId: 'test_library',
                recordId: 'test_record',
                content: contentV1,
                ctx,
            });
            await recordSDORepo.upsertContent({
                recordUUID,
                libraryId: 'test_library',
                recordId: 'test_record',
                content: contentV2,
                ctx,
            });

            expect(await recordSDORepo.getContent({recordUUID, ctx})).toEqual(contentV2);
        });
    });

    describe('deleteContent', () => {
        it('should remove the content document', async () => {
            const recordUUID = crypto.randomUUID();
            const content = {system: {systemId: recordUUID}, info: {value: 'v1'}} as unknown as ISDO['content'];

            await recordSDORepo.upsertContent({
                recordUUID,
                libraryId: 'test_library',
                recordId: 'test_record',
                content,
                ctx,
            });
            expect(await recordSDORepo.getContent({recordUUID, ctx})).toEqual(content);

            await recordSDORepo.deleteContent({recordUUID, ctx});

            expect(await recordSDORepo.getContent({recordUUID, ctx})).toBeNull();
        });

        it('should be a no-op when no content document exists', async () => {
            const recordUUID = crypto.randomUUID();

            await expect(recordSDORepo.deleteContent({recordUUID, ctx})).resolves.not.toThrow();
        });
    });
});
