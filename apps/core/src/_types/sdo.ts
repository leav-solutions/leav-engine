import {type IAttribute} from './attribute';
import {type IQueryInfos} from './queryInfos';

export type SDOAction = 'CREATE' | 'UPDATE';

export interface ISDO {
    dataModelRelease: string;
    name: string; // library
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

export interface ISDOMappingAttribute {
    /**
     * LEAV attribute id, or a dotted path traversing links/trees for export (e.g. "category.color").
     * Import ignores mapping entries whose leavAttributeId is a path, since a path can't be resolved
     * to a single writable attribute.
     */
    leavAttributeId: string;
    valueRequired: boolean;
    format: SDOMappingAttributeFormat;
    exportFunction?: string; // name of the function to use for export
}

export interface ISDOMappingLibrary {
    leavLibraryId: string;
    sdoAttributes: {
        [sdoAttributePath: string]: ISDOMappingAttribute;
    };
}

export interface ISDOMapping {
    [sdoLibraryId: string]: ISDOMappingLibrary;
}

export interface ISDOSettings {
    importEnable?: boolean;
    exportEnable?: boolean;
    timer?: number;
    mapping: ISDOMapping;
}

export type ISDOMappingFunction = (value: unknown, attributeProps: IAttribute, ctx: IQueryInfos) => Promise<unknown>;

export type ISDOMappingFunctions<Keys extends string = string> = Record<Keys, ISDOMappingFunction>;
