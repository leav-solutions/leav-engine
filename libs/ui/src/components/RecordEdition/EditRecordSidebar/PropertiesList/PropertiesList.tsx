// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Descriptions, Divider} from 'antd';

export interface IPropertiesListItemValue {
    title: string;
    value: string;
}

export interface IPropertiesListItemDivider {
    divider: boolean;
}

export type PropertiesListItem = IPropertiesListItemValue | IPropertiesListItemDivider;

interface IPropertiesListProps {
    items: PropertiesListItem[];
}

function PropertiesList({items}: IPropertiesListProps): JSX.Element {
    return (
        <Descriptions layout="horizontal" column={1}>
            {items.map((item, index) => {
                const {title, value} = item as IPropertiesListItemValue;

                return (
                    <Descriptions.Item
                        key={index}
                        label={title}
                        style={{paddingBottom: '5px'}}
                        labelStyle={{fontWeight: 'bold', width: '50%'}}
                    >
                        {(item as IPropertiesListItemDivider).divider ? (
                            <Divider key={index} data-testid="divider" />
                        ) : (
                            value
                        )}
                    </Descriptions.Item>
                );
            })}
        </Descriptions>
    );
}

export default PropertiesList;
