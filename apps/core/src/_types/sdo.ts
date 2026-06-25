import {type IAttribute} from './attribute';
import {type IQueryInfos} from './queryInfos';

export type SDOAction = 'CREATE' | 'UPDATE';

export interface ISDO {
    dataModelRelease: string;
    name: string; // library
    date: number;
    action: SDOAction;
    content: {
        system: {systemId: string; [attributePath: string]: unknown};
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
    leavAttributeId: string;
    valueRequired: boolean;
    format: SDOMappingAttributeFormat;
    exportFunction?: string; // name of the function to use for export
}

export interface ISDOMappingLibrary {
    leavLibraryId: string;
    sdoAttributes: {
        [sdoPathIdentifierUuid]: ISDOMappingAttribute;
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
