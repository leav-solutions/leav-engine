import {type ISDOSettings} from '../../../../_types/sdo';
import {CommonAttributes, UsersAttributes} from '../../../../_constants/systemAttributes';

// EXPORT
export const SDO_EXPORT_TIMER = 500;

export const SDO_EXPORTS_LIBRARY_ID = 'test_sdo_exports';

export const SDO_EXPORTS_TEST_ATTRIBUTE_ID = 'sdo_export_test_value';
export const SDO_EXPORTS_LINKED_LIBRARY_ID = 'test_sdo_exports_linked';
export const SDO_EXPORTS_SIMPLE_LINK_ATTRIBUTE_ID = 'sdo_export_test_simple_link';
export const SDO_EXPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID = 'sdo_export_test_advanced_link_mono';
export const SDO_EXPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID = 'sdo_export_test_advanced_link_multi';
export const SDO_EXPORTS_ADVANCED_MONO_ATTRIBUTE_ID = 'sdo_export_test_advanced_mono';
export const SDO_EXPORTS_ADVANCED_MULTI_ATTRIBUTE_ID = 'sdo_export_test_advanced_multi';
export const SDO_EXPORTS_TREE_ID = 'test_sdo_exports_tree';
export const SDO_EXPORTS_TREE_MONO_ATTRIBUTE_ID = 'sdo_export_test_tree_mono';
export const SDO_EXPORTS_TREE_MULTI_ATTRIBUTE_ID = 'sdo_export_test_tree_multi';
export const SDO_EXPORTS_DATE_RANGE_ATTRIBUTE_ID = 'sdo_export_test_date_range';
export const SDO_EXPORTS_EMBEDDED_ATTRIBUTE_ID = 'sdo_export_test_embedded';

// To test extendSDOFunction and additionalLibraryTriggers features
export const SDO_EXPORTS_EXTENDED_LIBRARY_ID = 'test_sdo_exports_extended';
export const SDO_EXPORTS_EXTENDED_VALUE_ATTRIBUTE_ID = 'sdo_export_extended_value';
export const SDO_EXPORTS_EXTEND_TRIGGER_LIBRARY_ID = 'test_sdo_exports_extend_trigger';
export const SDO_EXPORTS_EXTEND_TRIGGER_LINK_ATTRIBUTE_ID = 'sdo_export_extend_trigger_link';
export const SDO_EXPORTS_EXTEND_FUNCTION_NAME = 'fakeplugin_extendWithTriggers';

// IMPORT
export const SDO_IMPORTS_LIBRARY_ID = 'test_sdo_imports';
export const SDO_TEST_ATTRIBUTE_ID = 'sdo_test_value';

// A dotted path leavAttributeId, traversing the system link `modified_by` to the `users` library's
// `email` attribute — used to cover export/import of path-based mappings end-to-end.
export const SDO_EDITOR_EMAIL_LEAV_ATTRIBUTE_PATH = `${CommonAttributes.MODIFIED_BY}.${UsersAttributes.EMAIL}`;

// DTO IMPORT
// The DTO import reuses the SDO import domain, hence the same mapping structure. It gets its own
// library so it can't interfere with the SDO import tests running in parallel.
export const DTO_IMPORTS_LIBRARY_ID = 'test_dto_imports';
export const DTO_TEST_ATTRIBUTE_ID = 'dto_test_value';

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
                'info.advancedLinkMono': {
                    leavAttributeId: SDO_EXPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
                'info.advancedLinkMulti': {
                    leavAttributeId: SDO_EXPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'array',
                },
                'info.advancedMono': {
                    leavAttributeId: SDO_EXPORTS_ADVANCED_MONO_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
                'info.advancedMulti': {
                    leavAttributeId: SDO_EXPORTS_ADVANCED_MULTI_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'array',
                },
                'info.treeMono': {
                    leavAttributeId: SDO_EXPORTS_TREE_MONO_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
                'info.treeMulti': {
                    leavAttributeId: SDO_EXPORTS_TREE_MULTI_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'array',
                },
                // Sub-fields of a period (date_range) and of an extended attribute (LEAVC-786)
                'info.startDate': {
                    leavAttributeId: `${SDO_EXPORTS_DATE_RANGE_ATTRIBUTE_ID}.from`,
                    valueRequired: false,
                    format: 'number',
                },
                'info.endDate': {
                    leavAttributeId: `${SDO_EXPORTS_DATE_RANGE_ATTRIBUTE_ID}.to`,
                    valueRequired: false,
                    format: 'number',
                },
                'info.zipcode': {
                    leavAttributeId: `${SDO_EXPORTS_EMBEDDED_ATTRIBUTE_ID}.city.zipcode`,
                    valueRequired: false,
                    format: 'string',
                },
            },
        },
        [SDO_EXPORTS_EXTENDED_LIBRARY_ID]: {
            leavLibraryId: SDO_EXPORTS_EXTENDED_LIBRARY_ID,
            extendSDOFunction: SDO_EXPORTS_EXTEND_FUNCTION_NAME,
            additionalLibraryTriggers: [
                {
                    leavLibraryId: SDO_EXPORTS_EXTEND_TRIGGER_LIBRARY_ID,
                    leavAttributePath: SDO_EXPORTS_EXTEND_TRIGGER_LINK_ATTRIBUTE_ID,
                },
            ],
            sdoAttributes: {
                'info.value': {
                    leavAttributeId: SDO_EXPORTS_EXTENDED_VALUE_ATTRIBUTE_ID,
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
        [DTO_IMPORTS_LIBRARY_ID]: {
            leavLibraryId: DTO_IMPORTS_LIBRARY_ID,
            sdoAttributes: {
                'info.value': {leavAttributeId: DTO_TEST_ATTRIBUTE_ID, valueRequired: false, format: 'string'},
            },
        },
    },
};
