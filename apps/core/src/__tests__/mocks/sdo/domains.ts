import {type ISDOExportDomain} from '../../../domain/sdo/export/sdoExportDomain';
import {type ISDOImportDomain} from '../../../domain/sdo/import/sdoImportDomain';
import {type IDTOStatementDomain} from '../../../domain/sdo/dtoStatement/dtoStatementDomain';
import {type ISDODomain} from '../../../domain/sdo/sdoDomain';
import {type ISDOUtils} from '../../../utils/sdo/sdo';
import {type IRecordSDORepo} from '../../../infra/sdo/recordsSDORepo/recordSDORepo';

export const mockSdoDomain: Mockify<ISDODomain> = {
    schemaValidation: vi.fn(),
    getSDOGlobalSettings: vi.fn(),
    getRecordSDO: vi.fn(),
    resolveAdditionalLibraryTriggerTargets: vi.fn(),
    sendLog: vi.fn(),
    registerSDOExportMappingFunctions: vi.fn(),
    registerExtendSDOFunctions: vi.fn(),
};

export const mockImportDomain: Mockify<ISDOImportDomain> = {
    create: vi.fn(),
    update: vi.fn(),
};

export const mockDTOStatementDomain: Mockify<IDTOStatementDomain> = {
    sendStatement: vi.fn(),
};

export const mockExportDomain: Mockify<ISDOExportDomain> = {
    process: vi.fn(),
    sendSDO: vi.fn(),
    getSDOExportTargets: vi.fn(),
};

export const mockRecordSDORepo: Mockify<IRecordSDORepo> = {
    getContent: vi.fn(),
    upsertContent: vi.fn(),
    deleteContent: vi.fn(),
};

export const mockSDOUtils: Mockify<ISDOUtils> = {
    getLibraryMapping: vi.fn(),
    getAdditionalLibraryTriggers: vi.fn(),
    getLeavLibraryId: vi.fn(),
    hasSDOLibrary: vi.fn(),
    hasSDOAttribute: vi.fn(),
    getSDOLibrary: vi.fn(),
    getRecordUUIDFromSDO: vi.fn(),
    getMissingRequiredSDOAttributes: vi.fn(),
    tmpRecordIdToUuid: vi.fn(),
};
