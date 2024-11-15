// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {cloneElement, FunctionComponent, ReactNode} from 'react';
import {KitButton, KitDropDown, KitIdCard, KitSpace, KitTable} from 'aristid-ds';
import type {KitTableColumnType} from 'aristid-ds/dist/Kit/DataDisplay/Table/types';
import type {IKitAvatar} from 'aristid-ds/dist/Kit/DataDisplay/Avatar/types';
import {FaEllipsisH} from 'react-icons/fa';
import {Override} from '@leav/utils';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {
    AttributeType,
    PropertyValueFragment,
    PropertyValueLinkValueFragment,
    PropertyValueTreeValueFragment,
    PropertyValueValueFragment
} from '_ui/_gqlTypes';
import {IItemAction, IItemData, ItemWhoAmI} from './_types';

const USELESS = '';

const _getIdCard = ({id, label, library, preview, subLabel}: ItemWhoAmI): ReturnType<typeof KitIdCard> => {
    const avatarProps: IKitAvatar = {label: label ?? undefined};

    if (preview) {
        avatarProps.src = preview.small;
    }

    return <KitIdCard avatarProps={avatarProps} title={label ?? id} description={subLabel ?? library.id} />;
};

interface IDataViewProps {
    dataGroupedFilteredSorted: IItemData[];
    itemActions: IItemAction[];
    attributesToDisplay: string[];
}

export const DataView: FunctionComponent<IDataViewProps> = ({
    dataGroupedFilteredSorted,
    attributesToDisplay,
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

    const renderCell = (propertiesById: IItemData['propertiesById'], attributeName: string) => {
        // TODO: handle inherited and calculated values
        const isLinkValue = (v: PropertyValueFragment): v is PropertyValueLinkValueFragment =>
            [AttributeType.simple_link, AttributeType.advanced_link].includes(v.attribute.type);
        const isTreeValue = (v: PropertyValueFragment): v is PropertyValueTreeValueFragment =>
            [AttributeType.tree].includes(v.attribute.type);
        const isStandardValue = (v: PropertyValueFragment): v is PropertyValueValueFragment =>
            [AttributeType.simple, AttributeType.advanced].includes(v.attribute.type);

        const defaultValue = '';
        return propertiesById[attributeName]
            .map(value => {
                if (isStandardValue(value)) {
                    return value.valuePayload;
                }

                if (isTreeValue(value)) {
                    return value.treePayload?.record.id ?? defaultValue;
                }

                if (isLinkValue(value)) {
                    return value.linkPayload?.id ?? defaultValue;
                }
            })
            .join(', ');
    };

    const columns = attributesToDisplay
        .map<KitTableColumnType<IItemData>>(attributeName => ({
            title: attributeName,
            dataIndex: USELESS,
            render: (_, {whoAmI, propertiesById}) =>
                attributeName === 'whoAmI' ? _getIdCard(whoAmI) : renderCell(propertiesById, attributeName)
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

    return <KitTable columns={columns} pagination={false} dataSource={dataGroupedFilteredSorted} />;
};
