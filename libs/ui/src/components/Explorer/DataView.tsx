// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {cloneElement, FunctionComponent, ReactNode} from 'react';
import {KitButton, KitDropDown, KitIdCard, KitSpace, KitTable} from 'aristid-ds';
import type {DataGroupedFilteredSorted, ItemActions} from './types';
import type {KitTableColumnType} from 'aristid-ds/dist/Kit/DataDisplay/Table/types';
import type {IKitAvatar} from 'aristid-ds/dist/Kit/DataDisplay/Avatar/types';
import {FaEllipsisH} from 'react-icons/fa';
import {Override} from '@leav/utils';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {TFunction} from 'i18next';

const USELESS = '';

const _getIdCard = ({
    id,
    label,
    library,
    preview,
    subLabel
}: IDataViewProps['dataGroupedFilteredSorted'][number]['value']): ReturnType<typeof KitIdCard> => {
    const avatarProps: IKitAvatar = {label: label ?? undefined};

    if (preview) {
        avatarProps.src = preview.small;
    }

    return <KitIdCard avatarProps={avatarProps} title={label ?? id} description={subLabel ?? library.id} />;
};

const _getActionButtons = (
    itemActions: Array<Override<ItemActions<any>[number], {callback: () => void}>>,
    t: TFunction<'shared'>
): ReactNode => {
    const isLessThanFourActions = itemActions.length < 4;

    return isLessThanFourActions ? (
        <KitSpace>
            {itemActions.map(({label, icon, isDanger, callback}) => (
                <KitButton title={label} icon={icon} onClick={callback} danger={isDanger}>
                    {label}
                </KitButton>
            ))}
        </KitSpace>
    ) : (
        <>
            <KitButton
                type="tertiary"
                icon={itemActions[0].icon}
                onClick={itemActions[0].callback}
                title={itemActions[0].label}
                danger={itemActions[0].isDanger}
            />
            <KitButton
                type="tertiary"
                icon={itemActions[1].icon}
                onClick={itemActions[1].callback}
                title={itemActions[1].label}
                danger={itemActions[1].isDanger}
            />
            <KitDropDown
                menu={{
                    items: itemActions.slice(2).map(({callback, icon, label, isDanger}) => ({
                        key: label,
                        title: label,
                        danger: isDanger,
                        label,
                        icon: icon ? cloneElement(icon, {size: '2em'}) : null, // TODO: find better tuning
                        onClick: callback
                    }))
                }}
            >
                <KitButton title={t('explorer.more-actions') ?? undefined} type="tertiary" icon={<FaEllipsisH />} />
            </KitDropDown>
        </>
    );
};
const _getColumns = (
    attributesToDisplay: IDataViewProps['attributesToDisplay'],
    itemActions: IDataViewProps['itemActions'],
    t: TFunction<'shared'>
): Array<KitTableColumnType<DataGroupedFilteredSorted<'whoAmI'>[number]>> =>
    attributesToDisplay
        .map<KitTableColumnType<DataGroupedFilteredSorted<'whoAmI'>[number]>>(attributeName => ({
            title: attributeName,
            dataIndex: attributeName,
            render: (text, {value}) => (attributeName === 'whoAmI' ? _getIdCard(value) : text)
        }))
        .concat(
            itemActions.length === 0
                ? []
                : [
                      {
                          title: t('explorer.actions'),
                          fixed: 'right',
                          dataIndex: USELESS,
                          render: (_, item) =>
                              _getActionButtons(
                                  itemActions.map(action => ({
                                      ...action,
                                      callback: () => action.callback(item)
                                  })),
                                  t
                              )
                      }
                  ]
        );

interface IDataViewProps {
    dataGroupedFilteredSorted: DataGroupedFilteredSorted<'whoAmI'>;
    itemActions: ItemActions<any>;
    attributesToDisplay: string[];
}

export const DataView: FunctionComponent<IDataViewProps> = ({
    dataGroupedFilteredSorted,
    attributesToDisplay,
    itemActions
}) => {
    const {t} = useSharedTranslation();

    return (
        <KitTable
            columns={_getColumns(attributesToDisplay, itemActions, t)}
            pagination={false}
            dataSource={dataGroupedFilteredSorted}
        />
    );
};
