// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, ReactNode, useCallback} from 'react';
import {
    AttributeFormat,
    AttributePropertiesFragment,
    AttributeType,
    PropertyValueFragment,
    PropertyValueLinkValueFragment,
    PropertyValueTreeValueFragment,
    PropertyValueValueFragment
} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FaArrowRight, FaCalendar, FaListAlt} from 'react-icons/fa';
import DOMPurify from 'dompurify';
import {KitAvatar, KitSpace, KitTag, KitTypography} from 'aristid-ds';
import {IKitTag, IKitTagConfig} from 'aristid-ds/dist/Kit/DataDisplay/Tag/types';
import styled from 'styled-components';
import {IdCard} from './IdCard';
import {multiColorTagAvatarClassName, TableTagGroup} from './TableTagGroup';
import {AggregationColor} from 'antd/es/color-picker/color';

const isStandardValue = (
    v: PropertyValueFragment,
    attribute: AttributePropertiesFragment
): v is PropertyValueValueFragment => [AttributeType.simple, AttributeType.advanced].includes(attribute.type);
const isStandardValues = (
    values: PropertyValueFragment[],
    attribute: AttributePropertiesFragment
): values is PropertyValueValueFragment[] => values.every(value => isStandardValue(value, attribute));

const isLinkValue = (
    v: PropertyValueFragment,
    attribute: AttributePropertiesFragment
): v is PropertyValueLinkValueFragment =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(attribute.type);
const isLinkValues = (
    values: PropertyValueFragment[],
    attribute: AttributePropertiesFragment
): values is PropertyValueLinkValueFragment[] => values.every(value => isLinkValue(value, attribute));

const isTreeValue = (
    v: PropertyValueFragment,
    attribute: AttributePropertiesFragment
): v is PropertyValueTreeValueFragment => [AttributeType.tree].includes(attribute.type);

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

const StyledFaListAlt = styled(FaListAlt)`
    flex-shrink: 0;
`;

const StyledFaCalendar = styled(FaCalendar)`
    flex-shrink: 0;
`;

interface ITableCellProps {
    values: PropertyValueFragment[];
    attributeProperties: AttributePropertiesFragment;
}

export const TableCell: FunctionComponent<ITableCellProps> = ({values, attributeProperties}) => {
    const {t} = useSharedTranslation();

    const _getDateRangeValueContent = useCallback((value: PropertyValueValueFragment['valuePayload']) => {
        if (!isDateRangeValue(value)) {
            return t('explorer.invalid-value');
        }

        return (
            <KitSpace size="xxs">
                <StyledFaCalendar />
                {value.from} <FaArrowRight /> {value.to}
            </KitSpace>
        );
    }, []);

    const _getFirstValue = useCallback(
        (value: PropertyValueValueFragment['valuePayload'], attribute: AttributePropertiesFragment) => {
            if (isStandardValue(value, attribute) && attribute.format === AttributeFormat.boolean) {
                if (!value || value.valuePayload === null) {
                    return {valuePayload: false};
                }
            }
            return value;
        },
        []
    );

    if (attributeProperties.multiple_values) {
        if (isStandardValues(values, attributeProperties)) {
            const tags = values.map<IKitTagConfig>(value => {
                switch (attributeProperties.format) {
                    case AttributeFormat.boolean:
                        return {
                            idCardProps: {
                                description: value.valuePayload ? String(t('global.yes')) : String(t('global.no'))
                            },
                            type: value.valuePayload ? 'primary' : ('neutral' as IKitTag['type'])
                        };
                    case AttributeFormat.color:
                        const color = new AggregationColor(value.valueRawPayload);
                        return {
                            idCardProps: {
                                description: value.valuePayload,
                                avatarProps: {
                                    color: color.toHexString(),
                                    shape: 'square',
                                    className: multiColorTagAvatarClassName
                                }
                            }
                        };
                    case AttributeFormat.date_range:
                        return {
                            idCardProps: {
                                description: _getDateRangeValueContent(value.valuePayload)
                            },
                            type: 'primary'
                        };
                    default:
                        const valueContent =
                            attributeProperties.format === AttributeFormat.encrypted
                                ? '●●●●●●●●●●●●'
                                : value.valuePayload;
                        return {
                            idCardProps: {description: valueContent},
                            type: 'primary'
                        };
                }
            });
            return <TableTagGroup tags={tags} />;
        } else if (isLinkValues(values, attributeProperties)) {
            return (
                <KitAvatar.Group max={{count: 5}}>
                    {values.map((value, index) => {
                        if (!isLinkValue(value, attributeProperties)) {
                            return null;
                        }

                        return (
                            <KitAvatar
                                key={index}
                                label={String(value?.linkPayload?.whoAmI.label)}
                                src={value?.linkPayload?.whoAmI.preview?.small}
                                color="primary"
                                secondaryColorInvert
                            />
                        );
                    })}
                </KitAvatar.Group>
            );
        } else {
            // TODO: handle multiple tree values
            return null;
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
                case AttributeFormat.boolean:
                    const valueToDisplay = value.valuePayload ? t('global.yes') : t('global.no');
                    content = (
                        <KitTag
                            key={attributeProperties.id}
                            type={!!value.valuePayload ? 'primary' : 'neutral'}
                            idCardProps={{description: valueToDisplay}}
                        />
                    );
                    break;
                case AttributeFormat.rich_text:
                    const tmp = document.createElement('div');
                    tmp.innerHTML = DOMPurify.sanitize(value.valuePayload);
                    const textContent = tmp.textContent;
                    content = (
                        <>
                            <StyledFaListAlt />
                            <KitTypography.Text key={attributeProperties.id} ellipsis={{tooltip: textContent}}>
                                {textContent}
                            </KitTypography.Text>
                        </>
                    );
                    break;
                case AttributeFormat.color:
                    const color = new AggregationColor(value.valueRawPayload);
                    content = (
                        <>
                            <StyledColorChip $colorTextContent={color.toHexString()} />
                            <KitTypography.Text key={attributeProperties.id} ellipsis={{tooltip: value.valuePayload}}>
                                {value.valuePayload}
                            </KitTypography.Text>
                        </>
                    );
                    break;
                case AttributeFormat.date_range:
                    content = _getDateRangeValueContent(value.valuePayload);
                    break;
                default:
                    const valueContent =
                        attributeProperties.format === AttributeFormat.encrypted ? '●●●●●●●●●●●●' : value.valuePayload;
                    content = (
                        <KitTypography.Text key={attributeProperties.id} ellipsis={{tooltip: valueContent}}>
                            {valueContent}
                        </KitTypography.Text>
                    );
                    break;
            }
        }

        if (isTreeValue(value, attributeProperties)) {
            content = value.treePayload?.record.id ?? '';
        }

        if (isLinkValue(value, attributeProperties)) {
            content = value.linkPayload?.whoAmI ? (
                <IdCard key={attributeProperties.id} item={value.linkPayload?.whoAmI} />
            ) : null;
        }

        return <StyledCenteringWrapper>{content}</StyledCenteringWrapper>;
    }
};
