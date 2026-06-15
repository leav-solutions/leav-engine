import Crypto from 'crypto';
import _ from 'lodash';
import {type ISDO, sdoPathIdentifierUuid, type ISDOMapping, type ISDOMappingLibrary} from '../../_types/sdo';

export interface ISDOUtils {
    getLibraryMapping: (sdoGlobalSettingsMapping: ISDOMapping, libraryId: string) => ISDOMappingLibrary | undefined;
    getLeavLibraryId: (mapping: ISDOMapping, sdo: ISDO) => string;
    hasSDOLibrary: (mapping: ISDOMapping, leavLibraryId: string) => boolean;
    hasSDOAttribute: (sdoLibrary: ISDOMappingLibrary, attribute: string) => boolean;
    getSDOLibrary: (sdoLibrary: ISDOMapping, leavLibraryId: string) => ISDOMappingLibrary;
    getLibraryUUIDAttributeID: (mapping: ISDOMapping, leavLibraryId: string) => string;
    getRecordUUIDFromSDO: (sdo: ISDO) => string;
    tmpRecordIdToUuid: (recordId: string) => string;
    createHash: (sdo: ISDO) => string;
}

export default function (): ISDOUtils {
    const getLibraryMapping = (
        sdoGlobalSettingsMapping: ISDOMapping,
        libraryId: string,
    ): ISDOMappingLibrary | undefined =>
        Object.values(sdoGlobalSettingsMapping).find(libraryMapping => libraryMapping?.leavLibraryId === libraryId);

    const getSDOLibrary = (mapping: ISDOMapping, leavLibraryId: string) => {
        const lib = Object.values(mapping).find(sdoMappingLibrary => sdoMappingLibrary.leavLibraryId === leavLibraryId);
        if (!lib) {
            throw new Error('Library not found');
        }

        return lib;
    };

    const getLeavLibraryId = (mapping: ISDOMapping, sdo: ISDO) => mapping[sdo.name]?.leavLibraryId;
    const hasSDOLibrary = (mapping: ISDOMapping, leavLibraryId: string): boolean =>
        Object.values(mapping).some(sdoLibrary => sdoLibrary?.leavLibraryId === leavLibraryId);

    const hasSDOAttribute = (sdoLibrary: ISDOMappingLibrary, attribute: string): boolean =>
        Object.values(sdoLibrary.sdoAttributes ?? {}).some(({leavAttributeId}) => leavAttributeId === attribute);

    const getLibraryUUIDAttributeID = (mapping: ISDOMapping, leavLibraryId: string): string => {
        const libraryMapping = getLibraryMapping(mapping, leavLibraryId);
        if (!libraryMapping) {
            throw new Error(`Library mapping ${leavLibraryId} not found`);
        }
        const uuidMapping = libraryMapping.sdoAttributes[sdoPathIdentifierUuid];
        if (!uuidMapping) {
            throw new Error(`UUID Attribute mapping not found for library ${leavLibraryId}`);
        }
        return uuidMapping.leavAttributeId;
    };

    const getRecordUUIDFromSDO = (sdo: ISDO): string => {
        const recordUuid = _.get(sdo.content, sdoPathIdentifierUuid);
        if (!recordUuid || typeof recordUuid !== 'string') {
            throw new Error('Record UUID not found in SDO content');
        }
        return recordUuid;
    };

    // TODO replace by a real uuid in record inside leav when ready
    const tmpRecordIdToUuid = (recordId: string): string => `${recordId}`;

    const createHash = (sdo: ISDO) => Crypto.createHash('md5').update(JSON.stringify(sdo.content)).digest('hex');

    return {
        getLibraryMapping,
        getLeavLibraryId,
        hasSDOLibrary,
        hasSDOAttribute,
        getSDOLibrary,
        getLibraryUUIDAttributeID,
        getRecordUUIDFromSDO,
        tmpRecordIdToUuid,
        createHash,
    };
}
