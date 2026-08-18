import {type IAttribute} from './attribute';
import {type IQueryInfos} from './queryInfos';
import {type IRecord} from './record';
import {type IValue} from './value';

export type SDOAction = 'CREATE' | 'UPDATE';

export interface ISDO {
    dataModelRelease: string;
    name: string; // libraryId
    date: number;
    action: SDOAction;
    clientId?: string; // emitting application (AMP norm), from config.sdo.clientId
    content: {
        system: {
            systemId: string;
            systemActive: boolean;
            systemCreator: string;
            systemCreationDate: number;
            systemLastModificator: string;
            systemLastModifiedDate: number;
            systemLabel: string;
            applicationIds?: Record<string, unknown>; // internal ids per application
            systemCreatorClientId?: string | null; // application that created the record
            systemLastModificatorClientId?: string | null; // application generating this export (computed, not stored)
            [attributePath: string]: unknown;
        };
        [attributePath: string]: unknown;
    };
}

/**
 * Minimal shape needed to import an entity: the SDO type (i.e. the mapping key) and its content.
 * Shared by the SDO import (a full ISDO) and the DTO import (`payloadType` + `payloadDocument`).
 */
export type ISDOImportPayload = Pick<ISDO, 'name' | 'content'>;

export interface IBufferList {
    [libraryId: string]: Map<string, IBuffer>;
}

export interface IBuffer {
    library: string;
    recordId: string;
    timer: NodeJS.Timeout | null;
    /**
     * This promise will be resolve/reject once the buffer is processed or another event refresh the timer
     */
    promise: {resolve: () => void; reject: (error: Error) => void};
}

export type SDOMappingAttributeFormat = 'number' | 'integer' | 'boolean' | 'string' | 'array' | 'object';

export const sdoPathIdentifierUuid = 'system.systemId' as const;

/** Content block holding the business identifiers of an object */
export const sdoIdentifierBlock = 'identifier' as const;

export interface ISDOMappingAttribute {
    /**
     * LEAV attribute id, or a dotted path traversing links/trees for export (e.g. "category.color").
     *
     * Optional: an SDO path computed by an `exportFunction` from several sources has no single source
     * attribute. Import ignores entries without one, as it does for dotted paths — neither resolves to
     * a single writable attribute. An empty string means the same thing (an SDO path declared in the
     * config but not mapped yet) and behaves identically.
     */
    leavAttributeId?: string;
    valueRequired: boolean;
    format: SDOMappingAttributeFormat;
    /**
     * Name of a plugin-registered function (see registerSDOExportMappingFunctions) producing the value
     * of this SDO path. It may ignore `leavAttributeId` entirely and aggregate whatever it needs off the
     * record — which is how a whole computed block gets exported while staying declared in the mapping.
     */
    exportFunction?: string;
    /**
     * Opaque configuration handed to `exportFunction`. The core never interprets it: the plugin owning
     * the function defines and validates its shape. It lives on the mapping entry so an
     * instance-specific table (ids, behaviours…) stays editable in the admin custom config, with no
     * redeployment.
     */
    exportFunctionConfig?: Record<string, unknown>;
    /**
     * Exclude this attribute from the import (default `false`). The export is not affected: this is
     * the way to keep an attribute exported while never letting an incoming document write it.
     * Only meaningful on a library flagged `importEnable: true`, and it also neutralizes
     * `valueRequired` for this attribute — an attribute we chose not to import cannot be mandatory.
     */
    skipImport?: boolean;
}

export interface ISDOAdditionalLibraryTrigger {
    leavLibraryId: string;
    leavAttributePath: string;
}

export interface ISDOMappingLibrary {
    leavLibraryId: string;
    /**
     * Import this entity when an SDO/DTO is received (default `false`). The mapping being shared with
     * the export, an entity has to opt in explicitly to become importable.
     *
     * Nested under the instance-wide `ISDOSettings.importEnable`, which stays the global switch: no
     * entity is imported when imports are off at the root. Beware the defaults are asymmetric — the
     * root flag is permissive (only an explicit `false` turns imports off), this one is restrictive
     * (only an explicit `true` turns them on).
     */
    importEnable?: boolean;
    sdoAttributes: {
        [sdoAttributePath: string]: ISDOMappingAttribute;
    };
    /**
     * Export triggers sourced from ANOTHER library: when one of its records changes, follow
     * `leavAttributePath` from it to reach the record of `leavLibraryId` to re-export.
     *
     * Sibling of `additionalAttributeTriggers` — both declare additional reasons to export, named
     * after the source of the trigger.
     */
    additionalLibraryTriggers?: ISDOAdditionalLibraryTrigger[];
    /**
     * Export triggers sourced from an attribute OF `leavLibraryId` that is mapped to no SDO path — an
     * attribute read by an `exportFunction` to build a computed block, for instance. Without this,
     * saving such an attribute is skipped by `hasSDOAttribute` and no SDO is ever emitted.
     */
    additionalAttributeTriggers?: string[];
    /**
     * Name of a plugin-registered function (see registerExtendSDOFunctions) invoked at the end of the
     * SDO build to extend the whole SDO — e.g. inject aggregated data the generic attribute mapping
     * can't express. Called with the full record and the built SDO.
     */
    extendSDOFunction?: string;
}

export interface ISDOMapping {
    [sdoLibraryId: string]: ISDOMappingLibrary;
}

export interface ISDOTriggerTarget {
    leavLibraryId: string;
    recordId: string;
}

export interface ISDOExportTarget extends ISDOTriggerTarget {
    action: SDOAction;
}

export interface ISDOSettings {
    importEnable?: boolean;
    exportEnable?: boolean;
    timer?: number;
    mapping: ISDOMapping;
}

/**
 * Function producing the value of one SDO path on export, named by the mapping entry's
 * `exportFunction`. Its result goes through the entry's `format` before being set at its SDO path.
 * Either registered by a plugin (`registerSDOExportMappingFunctions`) or provided by the core
 * (`NATIVE_SDO_EXPORT_FUNCTIONS`).
 *
 * It is free to ignore `values` and build the whole thing off `record` — that is how a computed block
 * (aggregating linked records, reading a different attribute per hierarchy level…) gets exported while
 * remaining declared in the mapping. Such an entry needs no `leavAttributeId`, in which case `values`
 * and `attributeProps` are absent.
 */
export type ISDOExportMappingFunction = (params: {
    record: IRecord;
    /**
     * RAW values of the entry's `leavAttributeId`, as `getRecordFieldValue` returns them — NOT the
     * value the generic mapping would have exported. Declaring an `exportFunction` short-circuits
     * `_mapRecordAttributeValue`, precisely so links and trees stay `IRecord`s (`ILinkValue.payload`,
     * `ITreeValue.payload.record`) instead of being flattened to uuids.
     */
    values?: IValue[];
    /** Properties of the entry's carrier attribute — e.g. `linked_tree` for a tree attribute. */
    attributeProps?: IAttribute;
    /**
     * The entry's declared `format`. Handed over so a function can reject a format contradicting the
     * shape it produces, rather than letting `_cleanValue` silently coerce it (`array` on a
     * single-valued attribute becomes `[]`).
     */
    format: SDOMappingAttributeFormat;
    /** The entry's `exportFunctionConfig`, opaque to the core. */
    config?: Record<string, unknown>;
    ctx: IQueryInfos;
}) => Promise<unknown>;

export type ISDOExportMappingFunctions<Keys extends string = string> = Record<Keys, ISDOExportMappingFunction>;

/**
 * Export functions the core provides itself, usable by simply naming them in the mapping — no plugin
 * to write or deploy. They are pre-registered in the same registry as the plugin ones, and their names
 * are reserved: a plugin registering one of them is rejected rather than silently shadowing it.
 */
export const NATIVE_SDO_EXPORT_FUNCTIONS = {
    TO_ID_LABEL: 'toIDLabel',
} as const;

/**
 * What `toIDLabel` produces per linked entity. `id` is the entity's uuid, the SDO-wide way of
 * referencing an entity; `label` follows the target library's record identity, falling back to the
 * leav id.
 */
export interface ISDOIdLabel {
    id: string | null;
    label: string;
}

/**
 * Plugin function extending a whole SDO export. Receives the full LEAV record and the
 * SDO built from the generic attribute mapping, returns the (possibly extended) SDO.
 */
export type IExtendSDOFunction = (record: IRecord, sdo: ISDO, ctx: IQueryInfos) => Promise<ISDO>;

export type IExtendSDOFunctions<Keys extends string = string> = Record<Keys, IExtendSDOFunction>;
