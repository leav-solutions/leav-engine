import {type ISDOSettings, NATIVE_SDO_EXPORT_FUNCTIONS} from '../../../../_types/sdo';
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

// To test the native `toIDLabel` export function (LEAVC-1106).
// The linked library takes a real text label so an exported `label` is distinguishable from the id;
// the "unlabelled" one configures no recordIdentityConf at all, to cover the fallback on the leav id.
export const SDO_EXPORTS_LINKED_LABEL_ATTRIBUTE_ID = 'sdo_export_test_linked_label';
export const SDO_EXPORTS_UNLABELLED_LIBRARY_ID = 'test_sdo_exports_unlabelled';
export const SDO_EXPORTS_UNLABELLED_LINK_ATTRIBUTE_ID = 'sdo_export_test_unlabelled_link';

// To test extendSDOFunction and additionalLibraryTriggers features
export const SDO_EXPORTS_EXTENDED_LIBRARY_ID = 'test_sdo_exports_extended';
export const SDO_EXPORTS_EXTENDED_VALUE_ATTRIBUTE_ID = 'sdo_export_extended_value';
export const SDO_EXPORTS_EXTEND_TRIGGER_LIBRARY_ID = 'test_sdo_exports_extend_trigger';
export const SDO_EXPORTS_EXTEND_TRIGGER_LINK_ATTRIBUTE_ID = 'sdo_export_extend_trigger_link';
export const SDO_EXPORTS_EXTEND_FUNCTION_NAME = 'fakeplugin_extendWithTriggers';
// Mapped to no SDO path on purpose: only `additionalAttributeTriggers` makes saving it emit an export
export const SDO_EXPORTS_EXTEND_UNMAPPED_ATTRIBUTE_ID = 'sdo_export_extend_unmapped';

// To test an export mapping function on a COMPUTED SDO path — an entry with no leavAttributeId, whose
// value is built by the plugin from the record and the entry's own config.
export const SDO_EXPORTS_COMPUTED_FUNCTION_NAME = 'fakeplugin_computedBlock';
export const SDO_EXPORTS_COMPUTED_FUNCTION_CONFIG = {label: 'fakeplugin export function config'};

// IMPORT
export const SDO_IMPORTS_LIBRARY_ID = 'test_sdo_imports';
export const SDO_TEST_ATTRIBUTE_ID = 'sdo_test_value';
// Mapped with `skipImport: true` to cover the attribute exclusion (LEAVC-1091)
export const SDO_TEST_SKIPPED_ATTRIBUTE_ID = 'sdo_test_skipped_value';

// One attribute per type/cardinality the import domain dispatches on, mirroring the export section:
// an incoming SDO carries UUIDs for links and trees, which the import has to resolve to leav ids —
// and, for a tree, to the *node* carrying the record.
export const SDO_IMPORTS_LINKED_LIBRARY_ID = 'test_sdo_imports_linked';
export const SDO_IMPORTS_LINKED_LABEL_ATTRIBUTE_ID = 'sdo_import_test_linked_label';
export const SDO_IMPORTS_TREE_ID = 'test_sdo_imports_tree';
export const SDO_IMPORTS_SIMPLE_LINK_ATTRIBUTE_ID = 'sdo_import_test_simple_link';
export const SDO_IMPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID = 'sdo_import_test_advanced_link_mono';
export const SDO_IMPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID = 'sdo_import_test_advanced_link_multi';
export const SDO_IMPORTS_ADVANCED_MONO_ATTRIBUTE_ID = 'sdo_import_test_advanced_mono';
export const SDO_IMPORTS_ADVANCED_MULTI_ATTRIBUTE_ID = 'sdo_import_test_advanced_multi';
export const SDO_IMPORTS_TREE_MONO_ATTRIBUTE_ID = 'sdo_import_test_tree_mono';
export const SDO_IMPORTS_TREE_MULTI_ATTRIBUTE_ID = 'sdo_import_test_tree_multi';
// Mapped through its `.from` / `.to` sub-paths (LEAVC-786), exported but NEVER imported: a dotted
// path does not designate a single writable attribute.
export const SDO_IMPORTS_DATE_RANGE_ATTRIBUTE_ID = 'sdo_import_test_date_range';

// An entity mapped without `importEnable`, hence not importable (LEAVC-1091). Its own library so
// the ignored-import assertions can't interfere with the nominal import tests.
export const SDO_IMPORTS_DISABLED_LIBRARY_ID = 'test_sdo_imports_disabled';

// A dotted path leavAttributeId, traversing the system link `modified_by` to the `users` library's
// `email` attribute — used to cover export/import of path-based mappings end-to-end.
export const SDO_EDITOR_EMAIL_LEAV_ATTRIBUTE_PATH = `${CommonAttributes.MODIFIED_BY}.${UsersAttributes.EMAIL}`;

// DTO IMPORT
// The DTO import reuses the SDO import domain, hence the same mapping structure. It gets its own
// library so it can't interfere with the SDO import tests running in parallel.
export const DTO_IMPORTS_LIBRARY_ID = 'test_dto_imports';
export const DTO_TEST_ATTRIBUTE_ID = 'dto_test_value';
// Mapped with `valueRequired: true` to cover the mandatory field rejection (LEAVC-956)
export const DTO_TEST_MANDATORY_ATTRIBUTE_ID = 'dto_test_mandatory_value';
// Mapped `valueRequired: true` AND `skipImport: true`: excluded from the import, hence never
// mandatory (LEAVC-1091 x LEAVC-956) — requiring an attribute we decided not to write would reject
// the operation for nothing.
export const DTO_TEST_SKIPPED_MANDATORY_ATTRIBUTE_ID = 'dto_test_skipped_mandatory_value';
// Mapped under the `identifier` block, which the statement reports back from what leav stores
export const DTO_TEST_IDENTIFIER_ATTRIBUTE_ID = 'dto_test_identifier_code';
// One link attribute, to prove the SDO import domain's UUID resolution holds through the DTO flow
// too. The rest of the type matrix is covered by sdoImports.test.ts — the domain is shared.
export const DTO_IMPORTS_LINKED_LIBRARY_ID = 'test_dto_imports_linked';
export const DTO_TEST_LINK_ATTRIBUTE_ID = 'dto_test_link';

// A payload type mapped without `importEnable`: known to the instance, but not importable
export const DTO_IMPORTS_DISABLED_LIBRARY_ID = 'test_dto_imports_disabled';

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
                // Native `toIDLabel` export function (LEAVC-1106): the attribute is designated directly,
                // with no dotted path, and one entry produces the whole {id, label} pair.
                // The link/tree attributes below are ALSO mapped above without an export function: the
                // two forms coexist on the same attribute, which is the non-regression guarantee.
                'info.advancedLinkMultiPairs': {
                    leavAttributeId: SDO_EXPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'array',
                    exportFunction: NATIVE_SDO_EXPORT_FUNCTIONS.TO_ID_LABEL,
                },
                'info.treeMultiPairs': {
                    leavAttributeId: SDO_EXPORTS_TREE_MULTI_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'array',
                    exportFunction: NATIVE_SDO_EXPORT_FUNCTIONS.TO_ID_LABEL,
                },
                'info.simpleLinkPair': {
                    leavAttributeId: SDO_EXPORTS_SIMPLE_LINK_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'object',
                    exportFunction: NATIVE_SDO_EXPORT_FUNCTIONS.TO_ID_LABEL,
                },
                // Target library without recordIdentityConf → label falls back to the leav id
                'info.unlabelledPairs': {
                    leavAttributeId: SDO_EXPORTS_UNLABELLED_LINK_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'array',
                    exportFunction: NATIVE_SDO_EXPORT_FUNCTIONS.TO_ID_LABEL,
                },
            },
        },
        [SDO_EXPORTS_EXTENDED_LIBRARY_ID]: {
            leavLibraryId: SDO_EXPORTS_EXTENDED_LIBRARY_ID,
            extendSDOFunction: SDO_EXPORTS_EXTEND_FUNCTION_NAME,
            additionalAttributeTriggers: [SDO_EXPORTS_EXTEND_UNMAPPED_ATTRIBUTE_ID],
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
                // A computed SDO path: no leavAttributeId, so the import must skip it and the export
                // mapping function must still run and receive its config.
                'info.computed': {
                    valueRequired: false,
                    format: 'object',
                    exportFunction: SDO_EXPORTS_COMPUTED_FUNCTION_NAME,
                    exportFunctionConfig: SDO_EXPORTS_COMPUTED_FUNCTION_CONFIG,
                },
            },
        },
        [SDO_IMPORTS_LIBRARY_ID]: {
            leavLibraryId: SDO_IMPORTS_LIBRARY_ID,
            importEnable: true,
            sdoAttributes: {
                'info.value': {leavAttributeId: SDO_TEST_ATTRIBUTE_ID, valueRequired: false, format: 'string'},
                'info.editorEmail': {
                    leavAttributeId: SDO_EDITOR_EMAIL_LEAV_ATTRIBUTE_PATH,
                    valueRequired: false,
                    format: 'string',
                },
                // Exported like any other attribute, never written by an import
                'info.skippedValue': {
                    leavAttributeId: SDO_TEST_SKIPPED_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                    skipImport: true,
                },
                'info.simpleLink': {
                    leavAttributeId: SDO_IMPORTS_SIMPLE_LINK_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
                'info.advancedLinkMono': {
                    leavAttributeId: SDO_IMPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
                'info.advancedLinkMulti': {
                    leavAttributeId: SDO_IMPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'array',
                },
                'info.advancedMono': {
                    leavAttributeId: SDO_IMPORTS_ADVANCED_MONO_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
                'info.advancedMulti': {
                    leavAttributeId: SDO_IMPORTS_ADVANCED_MULTI_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'array',
                },
                'info.treeMono': {
                    leavAttributeId: SDO_IMPORTS_TREE_MONO_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
                'info.treeMulti': {
                    leavAttributeId: SDO_IMPORTS_TREE_MULTI_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'array',
                },
                // Sub-paths of a period attribute: exported (LEAVC-786) but not importable
                'info.startDate': {
                    leavAttributeId: `${SDO_IMPORTS_DATE_RANGE_ATTRIBUTE_ID}.from`,
                    valueRequired: false,
                    format: 'number',
                },
                'info.endDate': {
                    leavAttributeId: `${SDO_IMPORTS_DATE_RANGE_ATTRIBUTE_ID}.to`,
                    valueRequired: false,
                    format: 'number',
                },
            },
        },
        // Mapped without `importEnable`: an SDO received for this entity is acked and ignored
        [SDO_IMPORTS_DISABLED_LIBRARY_ID]: {
            leavLibraryId: SDO_IMPORTS_DISABLED_LIBRARY_ID,
            sdoAttributes: {
                'info.value': {leavAttributeId: SDO_TEST_ATTRIBUTE_ID, valueRequired: false, format: 'string'},
            },
        },
        // Mapped without `importEnable`: a DTO operation on this type is rejected with NOT_AUTHORIZED
        [DTO_IMPORTS_DISABLED_LIBRARY_ID]: {
            leavLibraryId: DTO_IMPORTS_DISABLED_LIBRARY_ID,
            sdoAttributes: {
                'info.value': {leavAttributeId: DTO_TEST_ATTRIBUTE_ID, valueRequired: false, format: 'string'},
            },
        },
        [DTO_IMPORTS_LIBRARY_ID]: {
            leavLibraryId: DTO_IMPORTS_LIBRARY_ID,
            importEnable: true,
            sdoAttributes: {
                'info.value': {leavAttributeId: DTO_TEST_ATTRIBUTE_ID, valueRequired: false, format: 'string'},
                'info.mandatoryValue': {
                    leavAttributeId: DTO_TEST_MANDATORY_ATTRIBUTE_ID,
                    valueRequired: true,
                    format: 'string',
                },
                // Required AND excluded from the import: `skipImport` wins, the operation passes
                'info.skippedMandatoryValue': {
                    leavAttributeId: DTO_TEST_SKIPPED_MANDATORY_ATTRIBUTE_ID,
                    valueRequired: true,
                    format: 'string',
                    skipImport: true,
                },
                'info.link': {
                    leavAttributeId: DTO_TEST_LINK_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
                'identifier.testCode': {
                    leavAttributeId: DTO_TEST_IDENTIFIER_ATTRIBUTE_ID,
                    valueRequired: false,
                    format: 'string',
                },
            },
        },
    },
};
