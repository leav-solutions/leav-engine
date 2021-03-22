// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dropdown, Menu} from 'antd';
import {IconEllipsisVertical} from 'assets/icons/IconEllipsisVertical';
import {StandardBtn} from 'components/app/StyledComponent/StandardBtn';
import {IRecordAndChildren} from 'graphQL/queries/trees/getTreeContentQuery';
import useStateShared from 'hooks/SharedStateHook/SharedReducerHook';
import React from 'react';
import {useTranslation} from 'react-i18next';

interface IDefaultActionsProps {
    isDetail: boolean;
    setItems?: React.Dispatch<React.SetStateAction<IRecordAndChildren[]>>;
}

function DefaultActions({setItems, isDetail}: IDefaultActionsProps): JSX.Element {
    const {t} = useTranslation();
    const {stateShared} = useStateShared();

    const sortItems = (asc: boolean) => {
        if (setItems) {
            setItems(items => {
                const newItems = [...items].sort((a, b) => {
                    if (asc) {
                        return parseInt(a.record.whoAmI.id, 10) - parseInt(b.record.whoAmI.id, 10);
                    }
                    return parseInt(b.record.whoAmI.id, 10) - parseInt(a.record.whoAmI.id, 10);
                });

                return newItems;
            });
        }
    };
    const handleSortAsc = () => {
        sortItems(true);
    };

    const handleSortDesc = () => {
        sortItems(false);
    };

    if (!isDetail && !stateShared.selection.selected.length) {
        return (
            <span role="dropdown-tree-actions">
                <Dropdown
                    placement="bottomRight"
                    overlay={
                        <Menu>
                            <Menu>
                                <Menu.Item onClick={handleSortAsc}>{t('navigation.actions.sort-asc')}</Menu.Item>
                                <Menu.Item onClick={handleSortDesc}>{t('navigation.actions.sort-desc')}</Menu.Item>
                            </Menu>
                        </Menu>
                    }
                >
                    <StandardBtn icon={<IconEllipsisVertical />} />
                </Dropdown>
            </span>
        );
    }
    return <></>;
}

export default DefaultActions;
