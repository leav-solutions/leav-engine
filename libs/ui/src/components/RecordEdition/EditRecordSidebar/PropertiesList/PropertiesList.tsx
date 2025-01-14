// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSpace, KitTypography} from 'aristid-ds';
import {FunctionComponent} from 'react';

interface IPropertiesListItemValue {
    title: string;
    value: string;
}

interface IPropertiesListProps {
    items: IPropertiesListItemValue[];
}

export const PropertiesList: FunctionComponent<IPropertiesListProps> = ({items}) => (
    <KitSpace size="s" direction="vertical">
        {items.map((item, index) => {
            const {title, value} = item;

            return (
                <KitSpace key={index} size="none" direction="vertical">
                    <KitTypography.Text size="fontSize7">{title}</KitTypography.Text>
                    <KitTypography.Text size="fontSize5" weight="bold">
                        {value}
                    </KitTypography.Text>
                </KitSpace>
            );
        })}
    </KitSpace>
);

export default PropertiesList;
