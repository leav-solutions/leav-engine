import {type ILogger} from '@leav/logger';
import {type IAttributeDomain} from '../../../domain/attribute/attributeDomain';
import {type IRecordDomain} from '../../../domain/record/recordDomain';
import {type IValueDomain} from '../../../domain/value/valueDomain';
import {type ITreeDomain} from '../../../domain/tree/treeDomain';
import {type IGlobalSettingsDomain} from '../../../domain/globalSettings/globalSettingsDomain';
import {type IEventsManagerDomain} from '../../../domain/eventsManager/eventsManagerDomain';
import {type IRecordRepo} from '../../../infra/record/recordRepo';

export {mockCtx, mockSystemQueryContext} from '../shared';

export const mockRecordRepo: Mockify<IRecordRepo> = {
    getRecord: vi.fn(),
};

export const mockRecordDomain: Mockify<IRecordDomain> = {
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    deleteRecord: vi.fn(),
    find: vi.fn(),
    getRecordFieldValue: vi.fn(),
    getRecordIdentity: vi.fn(),
    deactivateRecord: vi.fn(),
    activateRecord: vi.fn(),
    deactivateRecordsBatch: vi.fn(),
    activateRecordsBatch: vi.fn(),
    purgeInactiveRecords: vi.fn(),
};

export const mockAttributeDomain: Mockify<IAttributeDomain> = {
    getAttributeProperties: vi.fn(),
    getAttributes: vi.fn(),
    saveAttribute: vi.fn(),
    deleteAttribute: vi.fn(),
    getInputTypes: vi.fn(),
    getOutputTypes: vi.fn(),
    getLibraryAttributes: vi.fn(),
    getLibraryFullTextAttributes: vi.fn(),
    getAttributeLibraries: vi.fn(),
    getFormAttributes: vi.fn(),
    doesCompute: vi.fn(),
};

export const mockValueDomain: Mockify<IValueDomain> = {
    getValues: vi.fn(),
    getRecordFieldValue: vi.fn(),
    saveValue: vi.fn(),
    saveValueBatch: vi.fn(),
    deleteValue: vi.fn(),
    formatValue: vi.fn(),
};

export const mockTreeDomain: Mockify<ITreeDomain> = {
    isNodePresent: vi.fn(),
    isRecordPresent: vi.fn(),
    saveTree: vi.fn(),
    deleteTree: vi.fn(),
    getTrees: vi.fn(),
    getTreeProperties: vi.fn(),
    addElement: vi.fn(),
    moveElement: vi.fn(),
    deleteElement: vi.fn(),
    getTreeContent: vi.fn(),
    getElementChildren: vi.fn(),
    getElementAncestors: vi.fn(),
    getLinkedRecords: vi.fn(),
    getLibraryTreeId: vi.fn(),
    getRecordByNodeId: vi.fn(),
    getNodesByRecord: vi.fn(),
    getDefaultElement: vi.fn(),
};

export const mockGlobalSettingsDomain: Mockify<IGlobalSettingsDomain> = {
    saveSettings: vi.fn(),
    getSettings: vi.fn(),
};

export const mockEventsManagerDomain: Mockify<IEventsManagerDomain> = {
    sendDatabaseEvent: vi.fn(),
    sendPubSubEvent: vi.fn(),
    subscribe: vi.fn(),
    initPubSubEventsConsumer: vi.fn(),
    initCustomConsumer: vi.fn(),
    registerEventActions: vi.fn(),
    getActions: vi.fn(),
};

export const mockLogger: Mockify<ILogger> = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};
