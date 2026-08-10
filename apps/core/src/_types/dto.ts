import {type ISDO} from './sdo';

/**
 * `UPSERT` (referential SDOs) and `DELETE` (replaced by a soft delete through `system.systemActive`)
 * are not part of the contract implemented here.
 */
export type DTOMethod = 'CREATE' | 'UPDATE';

/**
 * A DTO is an import operation pushed by the Data Platform on the dedicated `<c>_dto_import`
 * exchange. Its `payloadDocument` has the same shape as the `content` of an exported SDO, so
 * mapping and validation rules can be shared between both flows.
 */
/**
 * Error codes of the statement contract, as listed in the SDO/DTO RabbitMQ contract (§4 "Gestion des
 * erreurs"). The whole catalog is declared here so the statement published at the end of an import
 * (LEAVC-983) can only ever carry a contractual code, but only a subset is raised for now.
 */
export enum DTOErrorCode {
    UNKNOWN = 'UNKNOWN',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    NOT_AUTHORIZED = 'NOT_AUTHORIZED',
    INVALID_TYPE = 'INVALID_TYPE',
    INVALID_METHOD = 'INVALID_METHOD',
    MANDATORY_FIELD_MISSING = 'MANDATORY_FIELD_MISSING',
    INVALID_FIELD_KEY = 'INVALID_FIELD_KEY',
    UNEDITABLE_FIELD_KEY = 'UNEDITABLE_FIELD_KEY',
    INVALID_FIELD_FORMAT = 'INVALID_FIELD_FORMAT',
    INVALID_FIELD_VALUE = 'INVALID_FIELD_VALUE',
    INVALID_NUMBER_VALUES = 'INVALID_NUMBER_VALUES',
    EMPTY_VALUE = 'EMPTY_VALUE',
    NON_UNIQUE_VALUE = 'NON_UNIQUE_VALUE',
    IDENTIFIER_FIELD_MISSING = 'IDENTIFIER_FIELD_MISSING',
    IDENTIFIER_NOT_FOUND = 'IDENTIFIER_NOT_FOUND',
    LINKED_IDENTIFIER_NOT_FOUND = 'LINKED_IDENTIFIER_NOT_FOUND',
    INVALID_CONTEXTUAL_IDENTIFIER = 'INVALID_CONTEXTUAL_IDENTIFIER',
    INVALID_PROJECT_BEHAVIOR = 'INVALID_PROJECT_BEHAVIOR',
    INVALID_PROJECT_BELONGING = 'INVALID_PROJECT_BELONGING',
    ASSET_SDO_ERROR = 'ASSET_SDO_ERROR',
    MECHANIC_SDO_ALREADY_EXIST = 'MECHANIC_SDO_ALREADY_EXIST',
    MULTIPLE_SDO_WITH_SAME_IDENTIFIER = 'MULTIPLE_SDO_WITH_SAME_IDENTIFIER',
    SDO_ALREADY_EXIST = 'SDO_ALREADY_EXIST',
    TIMEOUT = 'TIMEOUT',
}

/**
 * One entry of the statement's `details` array. `attribute` holds the SDO path of the offending
 * attribute (e.g. "info.label"), or `null` when the rejection is not field-scoped.
 */
export interface IDTOErrorDetail {
    code: DTOErrorCode;
    attribute: string | null;
    message: string;
}

/**
 * Outcome of an import operation, reported back to the emitter.
 */
export enum DTOStatementStatus {
    SUCCESS = 'SUCCESS',
    NO_CHANGE = 'NO_CHANGE',
    ERROR = 'ERROR',
}

/**
 * Identity of the imported object, echoed to the emitter on a non-error statement.
 */
export interface IDTOStatementIdentifier {
    system: {
        systemId: string;
        systemCreationDate: number;
        systemLastModifiedDate: number;
    };
    identifier: Record<string, unknown>;
}

/**
 * Acknowledgement of one import operation, published on the `<c>_dto_operation_statement` exchange.
 * The traceability ids are echoed as-is from the DTO so the emitter can correlate it.
 */
export interface IDTOStatement {
    operationId: string;
    requestId: string;
    dataModelRelease: string;
    correlationId: string;
    payloadType: string;
    method: DTOMethod;
    status: DTOStatementStatus;
    /** `null` unless the status is `ERROR` */
    details: IDTOErrorDetail[] | null;
    /** `null` on `ERROR` (the object was not touched) — snake_case comes from the contract */
    sdo_identifier: IDTOStatementIdentifier | null;
    /** epoch in SECONDS, per the contract (the SDO export envelope uses milliseconds) */
    date: number;
}

export interface IDTO {
    dataModelRelease: string;
    /**
     * Request (batch) identifier, echoed as-is in the statement
     */
    requestId: string;
    /**
     * Operation identifier, echoed as-is in the statement
     */
    operationId: string;
    /**
     * Correlation identifier provided by the emitter, echoed as-is in the statement
     */
    correlationId: string;
    /**
     * Targeted SDO type, i.e. the library
     */
    payloadType: string;
    method: DTOMethod;
    payloadDocument: ISDO['content'];
}
