import {type ISDOMapping, type ISDOMappingLibrary} from '../../_types/sdo';
import sdoUtils from './sdo';

describe('sdoUtils', () => {
    const {getAdditionalLibraryTriggers, hasSDOAttribute} = sdoUtils();

    describe('hasSDOAttribute', () => {
        const mappingLibrary: ISDOMappingLibrary = {
            leavLibraryId: 'campaigns',
            sdoAttributes: {
                'info.label': {leavAttributeId: 'campaigns_label', valueRequired: false, format: 'string'},
                'info.startDate': {leavAttributeId: 'campaigns_dates.from', valueRequired: false, format: 'number'},
                'info.editorEmail': {leavAttributeId: 'modified_by.email', valueRequired: false, format: 'string'},
            },
        };

        test('matches a directly mapped attribute', () => {
            expect(hasSDOAttribute(mappingLibrary, 'campaigns_label')).toBe(true);
        });

        test('matches the carrier attribute of a mapped sub-field path', () => {
            // A database event carries the saved attribute id ("campaigns_dates"), never the mapped path
            expect(hasSDOAttribute(mappingLibrary, 'campaigns_dates')).toBe(true);
            expect(hasSDOAttribute(mappingLibrary, 'modified_by')).toBe(true);
        });

        test('does not match an attribute that is not mapped', () => {
            expect(hasSDOAttribute(mappingLibrary, 'campaigns_comment')).toBe(false);
        });

        test('does not match on a partial segment', () => {
            expect(hasSDOAttribute(mappingLibrary, 'campaigns_date')).toBe(false);
            expect(hasSDOAttribute(mappingLibrary, 'campaigns_dates.from')).toBe(false);
        });

        test('does not crash when sdoAttributes is undefined', () => {
            expect(hasSDOAttribute({leavLibraryId: 'campaigns'} as ISDOMappingLibrary, 'campaigns_label')).toBe(false);
        });
    });

    describe('getAdditionalLibraryTriggers', () => {
        test('returns an empty array when no mapping declares additionalLibraryTriggers', () => {
            const mapping: ISDOMapping = {
                test: {leavLibraryId: 'leav_test_library', sdoAttributes: {}},
            };

            expect(getAdditionalLibraryTriggers(mapping, 'leav_test_library')).toEqual([]);
        });

        test('returns the match when a library declares a trigger for the trigger library', () => {
            const mapping: ISDOMapping = {
                test: {
                    leavLibraryId: 'leav_test_library',
                    sdoAttributes: {},
                    additionalLibraryTriggers: [
                        {leavLibraryId: 'trigger_library', leavAttributePath: 'leav_attribute_path_to_sdo_library'},
                    ],
                },
            };

            expect(getAdditionalLibraryTriggers(mapping, 'trigger_library')).toEqual([
                {
                    targetLeavLibraryId: 'leav_test_library',
                    attributePathToTarget: 'leav_attribute_path_to_sdo_library',
                },
            ]);
        });

        test('returns matches from multiple SDO libraries declaring a trigger on the same source library', () => {
            const mapping: ISDOMapping = {
                campaigns: {
                    leavLibraryId: 'campaigns',
                    sdoAttributes: {},
                    additionalLibraryTriggers: [
                        {leavLibraryId: 'structure_items', leavAttributePath: 'structure_items_campaign'},
                    ],
                },
                map: {
                    leavLibraryId: 'map',
                    sdoAttributes: {},
                    additionalLibraryTriggers: [
                        {leavLibraryId: 'structure_items', leavAttributePath: 'structure_items_map'},
                    ],
                },
            };

            expect(getAdditionalLibraryTriggers(mapping, 'structure_items')).toEqual([
                {targetLeavLibraryId: 'campaigns', attributePathToTarget: 'structure_items_campaign'},
                {targetLeavLibraryId: 'map', attributePathToTarget: 'structure_items_map'},
            ]);
        });

        test('excludes trigger entries whose leavLibraryId does not match the source library', () => {
            const mapping: ISDOMapping = {
                campaigns: {
                    leavLibraryId: 'campaigns',
                    sdoAttributes: {},
                    additionalLibraryTriggers: [
                        {leavLibraryId: 'structure_items_categories', leavAttributePath: 'thematic.campaign'},
                    ],
                },
            };

            expect(getAdditionalLibraryTriggers(mapping, 'structure_items')).toEqual([]);
        });

        test('does not crash when additionalLibraryTriggers is undefined', () => {
            const mapping: ISDOMapping = {
                campaigns: {leavLibraryId: 'campaigns', sdoAttributes: {}, additionalLibraryTriggers: undefined},
            };

            expect(getAdditionalLibraryTriggers(mapping, 'structure_items')).toEqual([]);
        });
    });
});
