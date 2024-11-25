// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AttributeFormat,
    AttributeType,
    PropertyValueFragment,
    PropertyValueLinkValueFragment,
    PropertyValueTreeValueFragment,
    PropertyValueValueFragment
} from '_ui/_gqlTypes';
import {KitSwitch, KitTypography} from 'aristid-ds';
import {FunctionComponent} from 'react';
import styled from 'styled-components';

const isLinkValue = (v: PropertyValueFragment): v is PropertyValueLinkValueFragment =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(v.attribute.type);
const isTreeValue = (v: PropertyValueFragment): v is PropertyValueTreeValueFragment =>
    [AttributeType.tree].includes(v.attribute.type);
const isStandardValue = (v: PropertyValueFragment): v is PropertyValueValueFragment =>
    [AttributeType.simple, AttributeType.advanced].includes(v.attribute.type);
const isBooleanFormatValue = (v: PropertyValueFragment): boolean => v.attribute.format === AttributeFormat.boolean;

const StyledCenteringWrapper = styled.div`
    display: flex;
    align-items: center;
`;

interface ITableCellProps {
    values: PropertyValueFragment[];
}

export const TableCell: FunctionComponent<ITableCellProps> = ({values}) => (
    <StyledCenteringWrapper>
        {values.map((value: PropertyValueFragment) => {
            if (isStandardValue(value)) {
                switch (value.attribute.format) {
                    case AttributeFormat.boolean:
                        return <KitSwitch key={value.attribute.id} checked={!!value.valuePayload} />;
                    default:
                        const valueContent =
                            value.attribute.format === AttributeFormat.encrypted ? '●●●●●●●●●●●●' : value.valuePayload;
                        return (
                            <KitTypography.Text key={value.attribute.id} ellipsis={{tooltip: valueContent}}>
                                {valueContent}
                            </KitTypography.Text>
                        );
                }
            }

            const defaultValue = '';
            if (isTreeValue(value)) {
                return value.treePayload?.record.id ?? defaultValue;
            }

            if (isLinkValue(value)) {
                return value.linkPayload?.id ?? defaultValue;
            }
        })}
    </StyledCenteringWrapper>
);
