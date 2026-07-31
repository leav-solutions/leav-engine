export const idFormatRegex = /^[a-z0-9_]+$/;
export const endpointFormatRegex = /^[a-z0-9-]+$/;

/**
 * Feature flags of the "tree attribute selection" epic (LEAVC-996), stored as keys of
 * `globalSettings.settings`. Both are independent: the modal V2 can be tested from the V1 form's
 * button before the V2 form even exists.
 *
 * Temporary: they are removed at the end of the epic — LEAVC-1077,
 * see docs/cleanup/tree-attribute-v2-cleanup.md.
 */
export const ENABLE_TREE_ATTRIBUTE_V2_FORM = 'enableTreeAttributeV2Form';
export const ENABLE_TREE_ATTRIBUTE_V2_MODAL = 'enableTreeAttributeV2Modal';
