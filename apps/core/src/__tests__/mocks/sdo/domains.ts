import {type ISDOExportDomain} from '../../../domain/sdo/export/sdoExportDomain';
import {type ISDOImportDomain} from '../../../domain/sdo/import/sdoImportDomain';
import {type ISDODomain} from '../../../domain/sdo/sdoDomain';
import {type ISDOUtils} from '../../../utils/sdo/sdo';
import {type IRecordSDORepo} from '../../../infra/sdo/recordsSDORepo/recordSDORepo';

export const mockSdoDomain: Mockify<ISDODomain> = {
    schemaValidation: vi.fn(),
    getSDOGlobalSettings: vi.fn(),
    getRecordSDO: vi.fn(),
    sendLog: vi.fn(),
};

export const mockImportDomain: Mockify<ISDOImportDomain> = {
    create: vi.fn(),
    update: vi.fn(),
};

export const mockExportDomain: Mockify<ISDOExportDomain> = {
    process: vi.fn(),
    sendSDO: vi.fn(),
    getSDODataEvent: vi.fn(),
};

export const mockRecordSDORepo: Mockify<IRecordSDORepo> = {
    getContent: vi.fn(),
    upsertContent: vi.fn(),
    deleteContent: vi.fn(),
};

export const mockSDOUtils: Mockify<ISDOUtils> = {
    getLibraryMapping: vi.fn(),
    getLeavLibraryId: vi.fn(),
    hasSDOLibrary: vi.fn(),
    hasSDOAttribute: vi.fn(),
    getSDOLibrary: vi.fn(),
    getRecordUUIDFromSDO: vi.fn(),
    tmpRecordIdToUuid: vi.fn(),
};
