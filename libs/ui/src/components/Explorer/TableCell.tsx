// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
import {KitTag, KitTypography} from 'aristid-ds';
import {FunctionComponent} from 'react';
import styled from 'styled-components';
import {IdCard} from './IdCard';
import {IKitTag, IKitTagConfig} from 'aristid-ds/dist/Kit/DataDisplay/Tag/types';
import {TableTagGroup} from './TableTagGroup';

const isLinkValue = (
    v: PropertyValueFragment,
    attribute: AttributePropertiesFragment
): v is PropertyValueLinkValueFragment =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(attribute.type);
const isTreeValue = (
    v: PropertyValueFragment,
    attribute: AttributePropertiesFragment
): v is PropertyValueTreeValueFragment => [AttributeType.tree].includes(attribute.type);
const isStandardValue = (
    v: PropertyValueFragment,
    attribute: AttributePropertiesFragment
): v is PropertyValueValueFragment => [AttributeType.simple, AttributeType.advanced].includes(attribute.type);

const StyledCenteringWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: calc(var(--general-spacing-xs) * 1px);
`;

interface ITableCellProps {
    values: PropertyValueFragment[];
    attributeProperties: AttributePropertiesFragment;
}

export const TableCell: FunctionComponent<ITableCellProps> = ({values, attributeProperties}) => {
    const {t} = useSharedTranslation();
    if (values.length > 1 && values.every(isStandardValue)) {
        const tags: IKitTagConfig[] = values.map(value => {
            switch (value.attribute.format) {
                case AttributeFormat.boolean:
                    return {
                        idCardProps: {
                            description: value.valuePayload ? String(t('global.yes')) : String(t('global.no'))
                        },
                        type: value.valuePayload ? 'primary' : ('neutral' as IKitTag['type'])
                    };
                default:
                    const valueContent =
                        value.attribute.format === AttributeFormat.encrypted ? '●●●●●●●●●●●●' : value.valuePayload;
                    return {
                        idCardProps: {description: valueContent},
                        type: 'primary'
                    };
            }
        });
        return <TableTagGroup tags={tags} />;
    }

    return (
        <StyledCenteringWrapper>
            {values.map((value: PropertyValueFragment) => {
                if (isStandardValue(value, attributeProperties)) {
                    switch (attributeProperties.format) {
                        case AttributeFormat.boolean:
                            const valueToDisplay = value.valuePayload ? t('global.yes') : t('global.no');
                            return (
                                <KitTag
                                    key={attributeProperties.id}
                                    type={!!value.valuePayload ? 'primary' : 'neutral'}
                                    idCardProps={{description: valueToDisplay}}
                                />
                            );
                        default:
                            const valueContent =
                                attributeProperties.format === AttributeFormat.encrypted
                                    ? '●●●●●●●●●●●●'
                                    : value.valuePayload;
                            return (
                                <KitTypography.Text key={attributeProperties.id} ellipsis={{tooltip: valueContent}}>
                                    {valueContent}
                                </KitTypography.Text>
                            );
                    }
                }

                const defaultValue = '';
                if (isTreeValue(value, attributeProperties)) {
                    return value.treePayload?.record.id ?? defaultValue;
                }

                if (isLinkValue(value, attributeProperties)) {
                    return value.linkPayload?.whoAmI ? (
                        <IdCard key={attributeProperties.id} item={value.linkPayload?.whoAmI} />
                    ) : null;
                }
            })}
        </StyledCenteringWrapper>
    );
};
