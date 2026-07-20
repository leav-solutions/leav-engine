import {type ISDOMapping} from '../../_types/sdo';
import sdoUtils from './sdo';

describe('sdoUtils', () => {
    const {getAdditionalLibraryTriggers} = sdoUtils();

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
