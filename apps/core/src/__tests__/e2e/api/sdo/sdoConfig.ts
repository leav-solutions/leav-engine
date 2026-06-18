import {type ISDOSettings} from '../../../../_types/sdo';

export const SDO_LIBRARY_ID = 'test_sdo';

export const SDO_EXPORT_TIMER = 500;

export const sdoGlobalSettings: ISDOSettings = {
    timer: SDO_EXPORT_TIMER,
    mapping: {
        [SDO_LIBRARY_ID]: {
            leavLibraryId: SDO_LIBRARY_ID,
            sdoAttributes: {
                'system.systemId': {leavAttributeId: 'id', valueRequired: true, format: 'number'},
                'system.systemActive': {leavAttributeId: 'active', valueRequired: false, format: 'boolean'},
                'system.systemCreationDate': {
                    leavAttributeId: 'created_at',
                    valueRequired: false,
                    format: 'number',
                },
                'system.systemLastModifiedDate': {
                    leavAttributeId: 'modified_at',
                    valueRequired: false,
                    format: 'number',
                },
                'system.systemSdoHash': {leavAttributeId: 'hash_sdo', valueRequired: false, format: 'string'},
                'identifier.uuid': {leavAttributeId: 'uuid', valueRequired: true, format: 'string'},
                // info object is required by generic.json schema; leavAttributeId '' maps to null (no fetch)
                'info._': {leavAttributeId: '', valueRequired: false, format: 'string'},
            },
        },
    },
};
