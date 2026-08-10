import {type ISDO, type ISDOMapping, type ISDOMappingLibrary} from '../../_types/sdo';
import sdoUtils from './sdo';

describe('sdoUtils', () => {
    const {getAdditionalLibraryTriggers, hasSDOAttribute, getMissingRequiredSDOAttributes} = sdoUtils();

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

        test('does not crash on an entry with no leavAttributeId', () => {
            // A computed SDO path built by an exportFunction designates no attribute
            const withComputedEntry: ISDOMappingLibrary = {
                leavLibraryId: 'campaigns',
                sdoAttributes: {
                    framing: {valueRequired: false, format: 'object', exportFunction: 'campaignFraming'},
                },
            };

            expect(hasSDOAttribute(withComputedEntry, 'campaigns_objectives')).toBe(false);
        });

        test('matches an attribute declared in additionalAttributeTriggers', () => {
            // Read by an extendSDOFunction, so mapped to no SDO path: nothing else would trigger it
            const withTriggerAttributes: ISDOMappingLibrary = {
                ...mappingLibrary,
                additionalAttributeTriggers: ['campaigns_objectives'],
            };

            expect(hasSDOAttribute(withTriggerAttributes, 'campaigns_objectives')).toBe(true);
            expect(hasSDOAttribute(withTriggerAttributes, 'campaigns_comment')).toBe(false);
            expect(hasSDOAttribute(mappingLibrary, 'campaigns_objectives')).toBe(false);
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

    describe('getMissingRequiredSDOAttributes', () => {
        const mappingLibrary: ISDOMappingLibrary = {
            leavLibraryId: 'campaigns',
            sdoAttributes: {
                'info.label': {leavAttributeId: 'campaigns_label', valueRequired: true, format: 'string'},
                'info.year': {leavAttributeId: 'campaigns_year', valueRequired: true, format: 'number'},
                'info.stores': {leavAttributeId: 'campaigns_stores', valueRequired: true, format: 'array'},
                'info.comment': {leavAttributeId: 'campaigns_comment', valueRequired: false, format: 'string'},
            },
        };

        const _content = (info: Record<string, unknown>): ISDO['content'] =>
            ({system: {systemId: 'uuid'}, info}) as unknown as ISDO['content'];

        test('returns nothing when every required attribute carries a value', () => {
            const content = _content({label: 'campaign', year: 2026, stores: ['1']});

            expect(getMissingRequiredSDOAttributes(mappingLibrary, content, 'CREATE')).toEqual([]);
            expect(getMissingRequiredSDOAttributes(mappingLibrary, content, 'UPDATE')).toEqual([]);
        });

        test('returns the required attributes absent from a CREATE', () => {
            const content = _content({label: 'campaign'});

            expect(getMissingRequiredSDOAttributes(mappingLibrary, content, 'CREATE')).toEqual([
                'info.year',
                'info.stores',
            ]);
        });

        test('ignores required attributes absent from an UPDATE, since it is a patch', () => {
            expect(getMissingRequiredSDOAttributes(mappingLibrary, _content({comment: 'patched'}), 'UPDATE')).toEqual(
                [],
            );
        });

        test.each([
            ['null', null],
            ['an empty string', ''],
            ['an empty array', []],
        ])('returns a required attribute explicitly emptied with %s on an UPDATE', (_label, emptyValue) => {
            expect(getMissingRequiredSDOAttributes(mappingLibrary, _content({label: emptyValue}), 'UPDATE')).toEqual([
                'info.label',
            ]);
        });

        test('does not consider a falsy but meaningful value as missing', () => {
            const content = _content({label: 'campaign', year: 0, stores: [false]});

            expect(getMissingRequiredSDOAttributes(mappingLibrary, content, 'CREATE')).toEqual([]);
        });

        test('ignores attributes which are not flagged valueRequired', () => {
            const content = _content({label: 'campaign', year: 2026, stores: ['1'], comment: ''});

            expect(getMissingRequiredSDOAttributes(mappingLibrary, content, 'CREATE')).toEqual([]);
        });

        test('does not crash when sdoAttributes is undefined', () => {
            expect(
                getMissingRequiredSDOAttributes(
                    {leavLibraryId: 'campaigns'} as ISDOMappingLibrary,
                    _content({}),
                    'CREATE',
                ),
            ).toEqual([]);
        });
    });
});
