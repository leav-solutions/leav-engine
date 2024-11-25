// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {cloneElement, FunctionComponent, ReactNode} from 'react';
import {KitButton, KitDropDown, KitSpace, KitTable} from 'aristid-ds';
import type {KitTableColumnType} from 'aristid-ds/dist/Kit/DataDisplay/Table/types';
import {FaEllipsisH} from 'react-icons/fa';
import {Override} from '@leav/utils';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IExplorerData, IItemAction, IItemData} from './_types';
import {TableCell} from './TableCell';
import {IdCard} from './IdCard';

const USELESS = '';

interface IDataViewProps {
    dataGroupedFilteredSorted: IItemData[];
    itemActions: IItemAction[];
    columnsLabels: IExplorerData['attributes'];
    attributesToDisplay: string[];
}

export const DataView: FunctionComponent<IDataViewProps> = ({
    dataGroupedFilteredSorted,
    attributesToDisplay,
    columnsLabels,
    itemActions
}) => {
    const {t} = useSharedTranslation();

    const _getActionButtons = (actions: Array<Override<IItemAction, {callback: () => void}>>): ReactNode => {
        const isLessThanFourActions = actions.length < 4;

        return isLessThanFourActions ? (
            <KitSpace>
                {actions.map(({label, icon, isDanger, callback}, index) => (
                    <KitButton title={label} icon={icon} onClick={callback} danger={isDanger} key={index}>
                        {label}
                    </KitButton>
                ))}
            </KitSpace>
        ) : (
            <>
                <KitButton
                    type="tertiary"
                    icon={actions[0].icon}
                    onClick={actions[0].callback}
                    title={actions[0].label}
                    danger={actions[0].isDanger}
                />
                <KitButton
                    type="tertiary"
                    icon={actions[1].icon}
                    onClick={actions[1].callback}
                    title={actions[1].label}
                    danger={actions[1].isDanger}
                />
                <KitDropDown
                    menu={{
                        items: actions.slice(2).map(({callback, icon, label, isDanger}) => ({
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

    const _getColumnName = (attributeName: string): string => columnsLabels?.[attributeName] ?? attributeName;

    const columns = attributesToDisplay
        .map<KitTableColumnType<IItemData>>(attributeName => ({
            title: attributeName === 'whoAmI' ? '' : _getColumnName(attributeName),
            dataIndex: USELESS,
            render: (_, {whoAmI, propertiesById}) =>
                attributeName === 'whoAmI' ? (
                    <IdCard item={whoAmI} />
                ) : (
                    <TableCell values={propertiesById[attributeName]} />
                )
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
                                  }))
                              )
                      }
                  ]
        );

    //TODO: handle columns width based on attribute type/format
    return <KitTable columns={columns} pagination={false} dataSource={dataGroupedFilteredSorted} tableLayout="fixed" />;
};
