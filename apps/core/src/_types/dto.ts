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
