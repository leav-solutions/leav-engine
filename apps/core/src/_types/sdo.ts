export type SDOAction = 'CREATE' | 'UPDATE';

export interface ISDO {
    dataModelRelease: string;
    name: string; // library
    date: number;
    action: SDOAction;
    content: {
        identifier?: {uuid: string};
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

export const sdoPathIdentifierUuid = 'identifier.uuid' as const;

export interface ISDOMappingAttribute {
    leavAttributeId: string;
    valueRequired: boolean;
    format: SDOMappingAttributeFormat;
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
    timer?: number;
    mapping: ISDOMapping;
}
