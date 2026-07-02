import {type ISDOSettings} from '../../../../_types/sdo';

export const SDO_EXPORT_TIMER = 500;

export const SDO_EXPORTS_LIBRARY_ID = 'test_sdo_exports';
export const SDO_IMPORTS_LIBRARY_ID = 'test_sdo_imports';

export const SDO_TEST_ATTRIBUTE_ID = 'sdo_test_value';

export const sdoGlobalSettings: ISDOSettings = {
    timer: SDO_EXPORT_TIMER,
    mapping: {
        [SDO_EXPORTS_LIBRARY_ID]: {
            leavLibraryId: SDO_EXPORTS_LIBRARY_ID,
            sdoAttributes: {
                'system.systemSdoHash': {leavAttributeId: 'hash_sdo', valueRequired: false, format: 'string'},
                // info object is required by generic.json schema; leavAttributeId '' maps to null (no fetch)
                'info._': {leavAttributeId: '', valueRequired: false, format: 'string'},
            },
        },
        [SDO_IMPORTS_LIBRARY_ID]: {
            leavLibraryId: SDO_IMPORTS_LIBRARY_ID,
            sdoAttributes: {
                'system.systemSdoHash': {leavAttributeId: 'hash_sdo', valueRequired: false, format: 'string'},
                'info.value': {leavAttributeId: SDO_TEST_ATTRIBUTE_ID, valueRequired: false, format: 'string'},
            },
        },
    },
};
