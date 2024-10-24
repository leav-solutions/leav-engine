// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {IDataGroupedFilteredSorted} from '_ui/components/Explorer/types';
import {KitIdCard, KitTable} from 'aristid-ds';
import {KitTableColumnType} from 'aristid-ds/dist/Kit/DataDisplay/Table/types';
import {IKitAvatar} from 'aristid-ds/dist/Kit/DataDisplay/Avatar/types';

const _getIdCard = ({
    id,
    label,
    library,
    preview,
    subLabel
}: IDataGroupedFilteredSorted<'whoAmI'>[number]['value']): ReturnType<typeof KitIdCard> => {
    const avatarProps: IKitAvatar = {label: label ?? undefined};

    if (preview) {
        avatarProps.src = preview.small;
    }

    return <KitIdCard avatarProps={avatarProps} title={label ?? id} description={subLabel ?? library.id} />;
};

const _getColumns = (
    attributesToDisplay: string[]
): Array<KitTableColumnType<IDataGroupedFilteredSorted<'whoAmI'>[number]>> =>
    attributesToDisplay.map(attributeName => ({
        title: attributeName,
        dataIndex: attributeName,
        render: (text, {value}) => (attributeName === 'whoAmI' ? _getIdCard(value) : text)
    }));

export const DataView: FunctionComponent<{
    dataGroupedFilteredSorted: IDataGroupedFilteredSorted<'whoAmI'>;
    attributesToDisplay: string[];
}> = ({dataGroupedFilteredSorted, attributesToDisplay}) => (
    <KitTable columns={_getColumns(attributesToDisplay)} pagination={false} dataSource={dataGroupedFilteredSorted} />
);
