import _ from 'lodash';
import {type ISDO, sdoPathIdentifierUuid, type ISDOMapping, type ISDOMappingLibrary} from '../../_types/sdo';

export interface ISDOAdditionalLibraryTriggerMatch {
    targetLeavLibraryId: string;
    attributePathToTarget: string;
}

export interface ISDOUtils {
    getLibraryMapping: (sdoGlobalSettingsMapping: ISDOMapping, libraryId: string) => ISDOMappingLibrary | undefined;
    getAdditionalLibraryTriggers: (mapping: ISDOMapping, eventLibraryId: string) => ISDOAdditionalLibraryTriggerMatch[];
    getLeavLibraryId: (mapping: ISDOMapping, sdo: ISDO) => string;
    hasSDOLibrary: (mapping: ISDOMapping, leavLibraryId: string) => boolean;
    hasSDOAttribute: (sdoLibrary: ISDOMappingLibrary, attribute: string) => boolean;
    getSDOLibrary: (sdoLibrary: ISDOMapping, leavLibraryId: string) => ISDOMappingLibrary;
    getRecordUUIDFromSDO: (sdo: ISDO) => string;
    tmpRecordIdToUuid: (recordId: string) => string;
}

export default function (): ISDOUtils {
    const getLibraryMapping = (
        sdoGlobalSettingsMapping: ISDOMapping,
        libraryId: string,
    ): ISDOMappingLibrary | undefined =>
        Object.values(sdoGlobalSettingsMapping).find(libraryMapping => libraryMapping?.leavLibraryId === libraryId);

    const getAdditionalLibraryTriggers = (
        mapping: ISDOMapping,
        eventLibraryId: string,
    ): ISDOAdditionalLibraryTriggerMatch[] => {
        const triggers: ISDOAdditionalLibraryTriggerMatch[] = [];

        for (const sdoMappingLibrary of Object.values(mapping)) {
            for (const trigger of sdoMappingLibrary.additionalLibraryTriggers ?? []) {
                if (trigger.leavLibraryId === eventLibraryId) {
                    triggers.push({
                        targetLeavLibraryId: sdoMappingLibrary.leavLibraryId,
                        attributePathToTarget: trigger.leavAttributePath,
                    });
                }
            }
        }

        return triggers;
    };

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

    const getRecordUUIDFromSDO = (sdo: ISDO): string => {
        const recordUuid = _.get(sdo.content, sdoPathIdentifierUuid);

        if (!recordUuid || typeof recordUuid !== 'string') {
            throw new Error('Record UUID not found in SDO content');
        }

        return recordUuid;
    };

    // TODO replace by a real uuid in record inside leav when ready
    const tmpRecordIdToUuid = (recordId: string): string => `${recordId}`;

    return {
        getLibraryMapping,
        getAdditionalLibraryTriggers,
        getLeavLibraryId,
        hasSDOLibrary,
        hasSDOAttribute,
        getSDOLibrary,
        getRecordUUIDFromSDO,
        tmpRecordIdToUuid,
    };
}
