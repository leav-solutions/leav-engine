import _ from 'lodash';
import {type ISDO, sdoPathIdentifierUuid, type ISDOMapping, type ISDOMappingLibrary} from '../../_types/sdo';
import {type DTOMethod} from '../../_types/dto';

export interface ISDOAdditionalLibraryTriggerMatch {
    targetLeavLibraryId: string;
    attributePathToTarget: string;
}

export interface ISDOUtils {
    getLibraryMapping: (sdoGlobalSettingsMapping: ISDOMapping, libraryId: string) => ISDOMappingLibrary | undefined;
    getAdditionalLibraryTriggers: (mapping: ISDOMapping, eventLibraryId: string) => ISDOAdditionalLibraryTriggerMatch[];
    getLeavLibraryId: (mapping: ISDOMapping, sdo: Pick<ISDO, 'name'>) => string;
    hasSDOLibrary: (mapping: ISDOMapping, leavLibraryId: string) => boolean;
    hasSDOAttribute: (sdoLibrary: ISDOMappingLibrary, attribute: string) => boolean;
    getSDOLibrary: (sdoLibrary: ISDOMapping, leavLibraryId: string) => ISDOMappingLibrary;
    getRecordUUIDFromSDO: (sdo: Pick<ISDO, 'content'>) => string;
    getMissingRequiredSDOAttributes: (
        sdoMappingLibrary: ISDOMappingLibrary,
        content: ISDO['content'],
        method: DTOMethod,
    ) => string[];
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

    const getLeavLibraryId = (mapping: ISDOMapping, sdo: Pick<ISDO, 'name'>) => mapping[sdo.name]?.leavLibraryId;
    const hasSDOLibrary = (mapping: ISDOMapping, leavLibraryId: string): boolean =>
        Object.values(mapping).some(sdoLibrary => sdoLibrary?.leavLibraryId === leavLibraryId);

    // A mapped leavAttributeId can be a path ("modified_by.email", "campaign_dates.from") while a
    // database event only ever carries the id of the attribute that was saved. Match on the path's
    // first segment, otherwise saving the carrier attribute would trigger no export at all.
    // `additionalAttributeTriggers` covers attributes read by an exportFunction to build a computed SDO
    // path: they belong to no SDO path themselves, so nothing else would ever make them trigger an export.
    const hasSDOAttribute = (sdoLibrary: ISDOMappingLibrary, attribute: string): boolean =>
        Object.values(sdoLibrary.sdoAttributes ?? {}).some(
            ({leavAttributeId}) => leavAttributeId?.split('.')[0] === attribute,
        ) || (sdoLibrary.additionalAttributeTriggers ?? []).includes(attribute);

    const getRecordUUIDFromSDO = (sdo: Pick<ISDO, 'content'>): string => {
        const recordUuid = _.get(sdo.content, sdoPathIdentifierUuid);

        if (!recordUuid || typeof recordUuid !== 'string') {
            throw new Error('Record UUID not found in SDO content');
        }

        return recordUuid;
    };

    const _isEmptyValue = (value: unknown): boolean =>
        value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

    /**
     * SDO paths (mapping keys) of the attributes flagged `valueRequired` in the mapping and left
     * without a value by the incoming document.
     *
     * A `CREATE` builds the whole entity: every required attribute must be there. An `UPDATE` is a
     * patch, so an absent attribute simply means "unchanged" — only an attribute explicitly present
     * but emptied is a rejection.
     */
    const getMissingRequiredSDOAttributes = (
        sdoMappingLibrary: ISDOMappingLibrary,
        content: ISDO['content'],
        method: DTOMethod,
    ): string[] =>
        Object.entries(sdoMappingLibrary.sdoAttributes ?? {})
            .filter(([, sdoAttr]) => sdoAttr.valueRequired)
            .filter(
                ([sdoKey]) => (method === 'CREATE' || _.has(content, sdoKey)) && _isEmptyValue(_.get(content, sdoKey)),
            )
            .map(([sdoKey]) => sdoKey);

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
        getMissingRequiredSDOAttributes,
        tmpRecordIdToUuid,
    };
}
