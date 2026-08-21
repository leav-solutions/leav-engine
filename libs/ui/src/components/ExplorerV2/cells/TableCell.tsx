import {type FunctionComponent, type ReactNode, useCallback} from 'react';
import {
    AttributeFormat,
    AttributeType,
    type PropertyValueFragment,
    type PropertyValueLinkValueFragment,
    type PropertyValueTreeValueFragment,
    type PropertyValueValueFragment,
    MultiDisplayOption,
} from '_ui/_gqlTypes';
import {type CellAttributeProperties} from '../_types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import DOMPurify from 'dompurify';
import {KitAvatar, KitBadge, KitIdCard, KitSpace, KitTag, KitTypography} from 'aristid-ds';
import {type IKitTag} from 'aristid-ds/dist/Kit/DataDisplay/Tag/types';
import {getContrastColor} from 'aristid-ds/dist/utils/functions';
import styled from 'styled-components';
import {IdCard} from './IdCard';
import {multiColorTagAvatarClassName, TableTagGroup} from './TableTagGroup';
import {AggregationColor} from 'antd/es/color-picker/color';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowRight, faCalendar, faListAlt} from '@fortawesome/free-solid-svg-icons';

const isStandardValue = (
    v: PropertyValueFragment,
    attribute: CellAttributeProperties,
): v is PropertyValueValueFragment => [AttributeType.simple, AttributeType.advanced].includes(attribute.type);
const isStandardValues = (
    values: PropertyValueFragment[],
    attribute: CellAttributeProperties,
): values is PropertyValueValueFragment[] => values.every(value => isStandardValue(value, attribute));

const isLinkValue = (
    v: PropertyValueFragment,
    attribute: CellAttributeProperties,
): v is PropertyValueLinkValueFragment =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(attribute.type);
const isLinkValues = (
    values: PropertyValueFragment[],
    attribute: CellAttributeProperties,
): values is PropertyValueLinkValueFragment[] => values.every(value => isLinkValue(value, attribute));

const isTreeValue = (
    v: PropertyValueFragment,
    attribute: CellAttributeProperties,
): v is PropertyValueTreeValueFragment => [AttributeType.tree].includes(attribute.type);
const isTreeValues = (
    values: PropertyValueFragment[],
    attribute: CellAttributeProperties,
): values is PropertyValueTreeValueFragment[] => values.every(value => isTreeValue(value, attribute));

const isDateRangeValue = (v: PropertyValueValueFragment['valuePayload']): v is {from: string; to: string} =>
    'from' in v && 'to' in v;

const StyledCenteringWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: calc(var(--general-spacing-xs) * 1px);
`;

const StyledColorChip = styled.div<{$colorTextContent: string}>`
    height: calc(var(--general-spacing-s) * 1px);
    width: calc(var(--general-spacing-s) * 1px);
    border-radius: calc(var(--general-border-radius-xs) * 1px);
    background-color: ${props => props.$colorTextContent};
`;

const RightIcon = styled(FontAwesomeIcon)`
    flex-shrink: 0;
`;

interface ITableCellProps {
    values: PropertyValueFragment[];
    attributeProperties: CellAttributeProperties;
}

const TOOLTIP_COLOR = '#ffffff';

// Delegate the contrast computation to the DS (getContrastColor returns the neutral palette hex,
// '#000000' | '#FFFFFF', or undefined for a named/unknown color). Remap to the 'black' | 'white'
// KitTypography keywords that the DS translates to neutral tokens (deterministic render + tests).
const _getTagTextColor = (color: string): 'black' | 'white' =>
    getContrastColor(color)?.toUpperCase() === '#000000' ? 'black' : 'white';

const _buildLinkTreeTag = (label: string | null | undefined, color: string | null | undefined): IKitTag => {
    const textColor = color ? _getTagTextColor(color) : 'white';
    const children = <KitTypography.Text color={textColor}>{label ?? undefined}</KitTypography.Text>;

    // No identity card color: keep the default primary (blue) tag.
    if (!color) {
        return {type: 'primary', children};
    }

    // UX-validated rendering: solid DS tag whose background is the linked entity's identity card
    // color, with a contrast-computed text color for readability.
    return {style: {backgroundColor: color, borderColor: color}, children};
};

export const TableCell: FunctionComponent<ITableCellProps> = ({values, attributeProperties}) => {
    const {t} = useSharedTranslation();

    const _getDateRangeValueContent = useCallback((value: PropertyValueValueFragment['valuePayload']) => {
        if (!isDateRangeValue(value)) {
            return t('explorer.invalid-value');
        }

        return (
            <KitSpace size="xxs">
                <RightIcon icon={faCalendar} />
                {value.from} <FontAwesomeIcon icon={faArrowRight} /> {value.to}
            </KitSpace>
        );
    }, []);

    const _getFirstValue = useCallback(
        (value: PropertyValueValueFragment['valuePayload'], attribute: CellAttributeProperties) => {
            if (isStandardValue(value, attribute) && attribute.format === AttributeFormat.boolean) {
                if (!value || value.valuePayload === null) {
                    return {valuePayload: false};
                }
            }
            return value;
        },
        [],
    );

    if (attributeProperties.multiple_values) {
        if (isStandardValues(values, attributeProperties)) {
            const tags = values.map<IKitTag>(value => {
                switch (attributeProperties.format) {
                    case AttributeFormat.boolean:
                        return {
                            children: (
                                <KitTypography.Text color={TOOLTIP_COLOR}>
                                    {value.valuePayload ? String(t('global.yes')) : String(t('global.no'))}
                                </KitTypography.Text>
                            ),
                            type: value.valuePayload ? 'primary' : ('neutral' as IKitTag['type']),
                        };
                    case AttributeFormat.color: {
                        const color = new AggregationColor(value.valueRawPayload);
                        return {
                            children: (
                                <KitIdCard
                                    description={value.valuePayload}
                                    avatarProps={{
                                        color: color.toHexString(),
                                        shape: 'square',
                                        className: multiColorTagAvatarClassName,
                                    }}
                                />
                            ),
                        };
                    }
                    case AttributeFormat.date_range:
                        return {
                            children: (
                                <KitTypography.Text color={TOOLTIP_COLOR}>
                                    {_getDateRangeValueContent(value.valuePayload)}
                                </KitTypography.Text>
                            ),
                            type: 'primary',
                        };
                    default: {
                        const valueContent =
                            attributeProperties.format === AttributeFormat.encrypted
                                ? '●●●●●●●●●●●●'
                                : value.valuePayload;
                        return {
                            children: <KitTypography.Text color={TOOLTIP_COLOR}>{valueContent}</KitTypography.Text>,
                            type: 'primary',
                        };
                    }
                }
            });
            return <TableTagGroup tags={tags} />;
        } else if (isLinkValues(values, attributeProperties)) {
            switch (attributeProperties.multi_link_display_option) {
                case MultiDisplayOption.tag:
                    return (
                        <TableTagGroup
                            tags={values.map(value =>
                                _buildLinkTreeTag(value.linkPayload?.whoAmI.label, value.linkPayload?.whoAmI.color),
                            )}
                        />
                    );

                case MultiDisplayOption.badge_qty:
                    return <KitBadge overflowCount={Infinity} count={values.length} color="primary" />;

                case MultiDisplayOption.avatar:
                default:
                    return (
                        <KitAvatar.Group max={{count: 5}}>
                            {values.map((value, index) => {
                                if (!isLinkValue(value, attributeProperties)) {
                                    return null;
                                }

                                return (
                                    <KitAvatar
                                        key={index}
                                        label={String(value.linkPayload?.whoAmI.label)}
                                        src={value.linkPayload?.whoAmI.preview?.small as string}
                                        color="primary"
                                        secondaryColorInvert
                                    />
                                );
                            })}
                        </KitAvatar.Group>
                    );
            }
        } else if (isTreeValues(values, attributeProperties)) {
            switch (attributeProperties.multi_tree_display_option) {
                case MultiDisplayOption.tag:
                    return (
                        <TableTagGroup
                            tags={values.map(value =>
                                _buildLinkTreeTag(
                                    value.treePayload?.record.whoAmI.label,
                                    value.treePayload?.record.whoAmI.color,
                                ),
                            )}
                        />
                    );
                case MultiDisplayOption.badge_qty:
                    return <KitBadge overflowCount={Infinity} count={values.length} color="primary" />;
                case MultiDisplayOption.avatar:
                default:
                    return (
                        <KitAvatar.Group max={{count: 5}}>
                            {values.map((value, index) => {
                                if (!isTreeValue(value, attributeProperties)) {
                                    return null;
                                }

                                return (
                                    <KitAvatar
                                        key={index}
                                        label={String(value.treePayload?.record.whoAmI.label)}
                                        src={value.treePayload?.record.whoAmI.preview?.small as string}
                                        color="primary"
                                        secondaryColorInvert
                                    />
                                );
                            })}
                        </KitAvatar.Group>
                    );
            }
        }
    } else {
        const value = _getFirstValue(values[0], attributeProperties); // Not multiple_values attribute should not have more than one value
        if (!value) {
            return null;
        }

        let content: ReactNode = null;
        if (isStandardValue(value, attributeProperties)) {
            if (value.valuePayload === null) {
                return null;
            }

            switch (attributeProperties.format) {
                case AttributeFormat.boolean: {
                    const valueToDisplay = value.valuePayload ? t('global.yes') : t('global.no');
                    content = (
                        <KitTag key={attributeProperties.id} type={value.valuePayload ? 'primary' : 'neutral'}>
                            <KitTypography.Text>{valueToDisplay}</KitTypography.Text>
                        </KitTag>
                    );
                    break;
                }
                case AttributeFormat.rich_text: {
                    const tmp = document.createElement('div');
                    tmp.innerHTML = DOMPurify.sanitize(value.valuePayload);
                    const textContent = tmp.textContent;
                    content = (
                        <>
                            <RightIcon icon={faListAlt} />
                            <KitTypography.AdvancedText key={attributeProperties.id} ellipsis={{tooltip: textContent}}>
                                {textContent}
                            </KitTypography.AdvancedText>
                        </>
                    );
                    break;
                }
                case AttributeFormat.color: {
                    const color = new AggregationColor(value.valueRawPayload);
                    content = (
                        <>
                            <StyledColorChip $colorTextContent={color.toHexString()} />
                            <KitTypography.AdvancedText
                                key={attributeProperties.id}
                                ellipsis={{tooltip: value.valuePayload}}
                            >
                                {value.valuePayload}
                            </KitTypography.AdvancedText>
                        </>
                    );
                    break;
                }
                case AttributeFormat.date_range:
                    content = _getDateRangeValueContent(value.valuePayload);
                    break;
                default: {
                    const valueContent =
                        attributeProperties.format === AttributeFormat.encrypted ? '●●●●●●●●●●●●' : value.valuePayload;
                    content = (
                        <KitTypography.AdvancedText key={attributeProperties.id} ellipsis={{tooltip: valueContent}}>
                            {valueContent}
                        </KitTypography.AdvancedText>
                    );
                    break;
                }
            }
        }

        // Only `tag` switches the rendering: `avatar` (any other value, including `badge_qty`, falls
        // back to it too) keeps the identity card, the historical mono-valued rendering. Multivalued
        // `avatar`, by contrast, renders a bare `KitAvatar.Group` — same stored value, deliberately
        // different rendering.
        if (isTreeValue(value, attributeProperties)) {
            const whoAmI = value.treePayload?.record.whoAmI;

            // Returned bare, outside of `StyledCenteringWrapper`: as a flex item the tag group would
            // only ever see its own content width — see the comment in `TableTagGroup`. The
            // multivalued branches above return it directly for the same reason.
            if (whoAmI?.label && attributeProperties.multi_tree_display_option === MultiDisplayOption.tag) {
                return <TableTagGroup tags={[_buildLinkTreeTag(whoAmI.label, whoAmI.color)]} />;
            }

            content = !whoAmI?.label ? null : <IdCard key={attributeProperties.id} item={whoAmI} />;
        }

        if (isLinkValue(value, attributeProperties)) {
            const whoAmI = value.linkPayload?.whoAmI;

            if (whoAmI && attributeProperties.multi_link_display_option === MultiDisplayOption.tag) {
                return <TableTagGroup tags={[_buildLinkTreeTag(whoAmI.label, whoAmI.color)]} />;
            }

            content = !whoAmI ? null : <IdCard key={attributeProperties.id} item={whoAmI} />;
        }

        return <StyledCenteringWrapper>{content}</StyledCenteringWrapper>;
    }

    return null;
};
