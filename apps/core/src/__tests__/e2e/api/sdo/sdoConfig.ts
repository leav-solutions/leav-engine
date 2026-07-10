import {type ISDOSettings} from '../../../../_types/sdo';
import {CommonAttributes, UsersAttributes} from '../../../../_constants/systemAttributes';

// EXPORT
export const SDO_EXPORT_TIMER = 500;

export const SDO_EXPORTS_LIBRARY_ID = 'test_sdo_exports';

export const SDO_EXPORTS_TEST_ATTRIBUTE_ID = 'sdo_export_test_value';
export const SDO_EXPORTS_LINKED_LIBRARY_ID = 'test_sdo_exports_linked';
export const SDO_EXPORTS_SIMPLE_LINK_ATTRIBUTE_ID = 'sdo_export_test_simple_link';
export const SDO_EXPORTS_ADVANCED_LINK_ATTRIBUTE_ID = 'sdo_export_test_advanced_link';
export const SDO_EXPORTS_TREE_ATTRIBUTE_ID = 'sdo_export_test_tree';
export const SDO_EXPORTS_TREE_ID = 'test_sdo_exports_tree';

// IMPORT
export const SDO_IMPORTS_LIBRARY_ID = 'test_sdo_imports';
export const SDO_TEST_ATTRIBUTE_ID = 'sdo_test_value';

// A dotted path leavAttributeId, traversing the system link `modified_by` to the `users` library's
// `email` attribute — used to cover export/import of path-based mappings end-to-end.
export const SDO_EDITOR_EMAIL_LEAV_ATTRIBUTE_PATH = `${CommonAttributes.MODIFIED_BY}.${UsersAttributes.EMAIL}`;

export const sdoGlobalSettings: ISDOSettings = {
    timer: SDO_EXPORT_TIMER,
    mapping: {
        [SDO_EXPORTS_LIBRARY_ID]: {
            leavLibraryId: SDO_EXPORTS_LIBRARY_ID,
            sdoAttributes: {
                'info.value': {
                    leavAttributeId: SDO_EXPORTS_TEST_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
                'info.editorEmail': {
                    leavAttributeId: SDO_EDITOR_EMAIL_LEAV_ATTRIBUTE_PATH,
                    valueRequired: false,
                    format: 'string',
                },
                'info.simpleLink': {
                    leavAttributeId: SDO_EXPORTS_SIMPLE_LINK_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
                'info.advancedLinks': {
                    leavAttributeId: SDO_EXPORTS_ADVANCED_LINK_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'array',
                },
                'info.treeValue': {
                    leavAttributeId: SDO_EXPORTS_TREE_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
            },
        },
        [SDO_IMPORTS_LIBRARY_ID]: {
            leavLibraryId: SDO_IMPORTS_LIBRARY_ID,
            sdoAttributes: {
                'info.value': {leavAttributeId: SDO_TEST_ATTRIBUTE_ID, valueRequired: false, format: 'string'},
                'info.editorEmail': {
                    leavAttributeId: SDO_EDITOR_EMAIL_LEAV_ATTRIBUTE_PATH,
                    valueRequired: false,
                    format: 'string',
                },
            },
        },
    },
};
