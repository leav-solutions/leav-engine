import {AttributeType, MultiDisplayOption} from '_ui/_gqlTypes';
import {type AttributeProperties, type AttributesPropertiesById} from '../_types';
import {isCountOnlyColumn, splitBadgeColumns} from './splitBadgeColumns';

const attribute = (overrides: Partial<AttributeProperties>): AttributeProperties => ({
    id: 'default',
    label: 'Default',
    type: AttributeType.simple,
    multiple_values: false,
    required: false,
    permissions: {edit_value: false},
    ...overrides,
});

describe('isCountOnlyColumn', () => {
    it('accepts a multivalued link attribute displayed as badge_qty', () => {
        expect(
            isCountOnlyColumn(
                attribute({
                    type: AttributeType.advanced_link,
                    multiple_values: true,
                    multi_link_display_option: MultiDisplayOption.badge_qty,
                }),
            ),
        ).toBe(true);
    });

    it('accepts a multivalued tree attribute displayed as badge_qty', () => {
        expect(
            isCountOnlyColumn(
                attribute({
                    type: AttributeType.tree,
                    multiple_values: true,
                    multi_tree_display_option: MultiDisplayOption.badge_qty,
                }),
            ),
        ).toBe(true);
    });

    it('rejects a mono-valued link attribute even displayed as badge_qty', () => {
        expect(
            isCountOnlyColumn(
                attribute({
                    type: AttributeType.advanced_link,
                    multiple_values: false,
                    multi_link_display_option: MultiDisplayOption.badge_qty,
                }),
            ),
        ).toBe(false);
    });

    it('rejects a mono-valued tree attribute even displayed as badge_qty', () => {
        expect(
            isCountOnlyColumn(
                attribute({
                    type: AttributeType.tree,
                    multiple_values: false,
                    multi_tree_display_option: MultiDisplayOption.badge_qty,
                }),
            ),
        ).toBe(false);
    });

    it('rejects a multivalued link attribute displayed as tag', () => {
        expect(
            isCountOnlyColumn(
                attribute({
                    type: AttributeType.advanced_link,
                    multiple_values: true,
                    multi_link_display_option: MultiDisplayOption.tag,
                }),
            ),
        ).toBe(false);
    });

    it('rejects a multivalued tree attribute displayed as avatar', () => {
        expect(
            isCountOnlyColumn(
                attribute({
                    type: AttributeType.tree,
                    multiple_values: true,
                    multi_tree_display_option: MultiDisplayOption.avatar,
                }),
            ),
        ).toBe(false);
    });

    it('rejects a standard multivalued attribute, even if a display option is (wrongly) set', () => {
        expect(
            isCountOnlyColumn(
                attribute({
                    type: AttributeType.simple,
                    multiple_values: true,
                    multi_link_display_option: MultiDisplayOption.badge_qty,
                }),
            ),
        ).toBe(false);
    });
});

describe('splitBadgeColumns', () => {
    it('sends a multivalued link badge_qty column to the badge side', () => {
        const attributesProperties: AttributesPropertiesById = {
            link: attribute({
                type: AttributeType.advanced_link,
                multiple_values: true,
                multi_link_display_option: MultiDisplayOption.badge_qty,
            }),
        };

        expect(splitBadgeColumns({attributeIds: ['link'], attributesProperties})).toEqual({
            dataAttributeIds: [],
            badgeAttributeIds: ['link'],
        });
    });

    it('sends a multivalued tree badge_qty column to the badge side', () => {
        const attributesProperties: AttributesPropertiesById = {
            tree: attribute({
                type: AttributeType.tree,
                multiple_values: true,
                multi_tree_display_option: MultiDisplayOption.badge_qty,
            }),
        };

        expect(splitBadgeColumns({attributeIds: ['tree'], attributesProperties})).toEqual({
            dataAttributeIds: [],
            badgeAttributeIds: ['tree'],
        });
    });

    it('keeps a mono-valued badge_qty column on the values side', () => {
        const attributesProperties: AttributesPropertiesById = {
            link: attribute({
                type: AttributeType.advanced_link,
                multiple_values: false,
                multi_link_display_option: MultiDisplayOption.badge_qty,
            }),
        };

        expect(splitBadgeColumns({attributeIds: ['link'], attributesProperties})).toEqual({
            dataAttributeIds: ['link'],
            badgeAttributeIds: [],
        });
    });

    it('keeps tag/avatar columns on the values side', () => {
        const attributesProperties: AttributesPropertiesById = {
            tag: attribute({
                type: AttributeType.advanced_link,
                multiple_values: true,
                multi_link_display_option: MultiDisplayOption.tag,
            }),
            avatar: attribute({
                type: AttributeType.tree,
                multiple_values: true,
                multi_tree_display_option: MultiDisplayOption.avatar,
            }),
        };

        expect(splitBadgeColumns({attributeIds: ['tag', 'avatar'], attributesProperties})).toEqual({
            dataAttributeIds: ['tag', 'avatar'],
            badgeAttributeIds: [],
        });
    });

    it('keeps a standard attribute on the values side even with a (misconfigured) display option', () => {
        const attributesProperties: AttributesPropertiesById = {
            standard: attribute({
                type: AttributeType.simple,
                multiple_values: true,
                multi_link_display_option: MultiDisplayOption.badge_qty,
            }),
        };

        expect(splitBadgeColumns({attributeIds: ['standard'], attributesProperties})).toEqual({
            dataAttributeIds: ['standard'],
            badgeAttributeIds: [],
        });
    });

    it('never sends the grouping axis to the badge side, even when it is a badge_qty column', () => {
        const attributesProperties: AttributesPropertiesById = {
            axis: attribute({
                type: AttributeType.tree,
                multiple_values: true,
                multi_tree_display_option: MultiDisplayOption.badge_qty,
            }),
        };

        expect(splitBadgeColumns({attributeIds: ['axis'], attributesProperties, groupByAttributeId: 'axis'})).toEqual({
            dataAttributeIds: ['axis'],
            badgeAttributeIds: [],
        });
    });

    it('never sends the grouping axis to the badge side even when already present in attributeIds', () => {
        const attributesProperties: AttributesPropertiesById = {
            axis: attribute({
                type: AttributeType.tree,
                multiple_values: true,
                multi_tree_display_option: MultiDisplayOption.badge_qty,
            }),
            other: attribute({
                type: AttributeType.advanced_link,
                multiple_values: true,
                multi_link_display_option: MultiDisplayOption.badge_qty,
            }),
        };

        expect(
            splitBadgeColumns({
                attributeIds: ['axis', 'other'],
                attributesProperties,
                groupByAttributeId: 'axis',
            }),
        ).toEqual({
            dataAttributeIds: ['axis'],
            badgeAttributeIds: ['other'],
        });
    });

    it('keeps an attribute id absent from attributesProperties (stale/deleted attribute) on the values side', () => {
        expect(splitBadgeColumns({attributeIds: ['gone'], attributesProperties: {}})).toEqual({
            dataAttributeIds: ['gone'],
            badgeAttributeIds: [],
        });
    });

    it('returns two empty lists for an empty attribute list', () => {
        expect(splitBadgeColumns({attributeIds: [], attributesProperties: {}})).toEqual({
            dataAttributeIds: [],
            badgeAttributeIds: [],
        });
    });
});
