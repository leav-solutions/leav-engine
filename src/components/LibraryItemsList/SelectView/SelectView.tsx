import {AppstoreFilled, MenuOutlined, PlusOutlined} from '@ant-design/icons';
import {Dropdown, Menu} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled, {CSSObject} from 'styled-components';
import {useStateItem} from '../../../Context/StateItemsContext';
import themingVar from '../../../themingVar';
import {TypeSideItem} from '../../../_types/types';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';

const DropdownButton = styled(Dropdown.Button)`
    .ant-dropdown-trigger {
        background-color: ${themingVar['@leav-secondary-bg']};
    }
`;

interface InnerDropdown {
    color?: string;
    style?: CSSObject;
}

const InnerDropdown = styled.span<InnerDropdown>`
    transform: translate(5px);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        left: -11px;
        top: 8px;
        border-radius: 50%;
        padding: 3px;
        background: ${({color}) => color ?? themingVar['@primary-color']};
    }
`;

function SelectView(): JSX.Element {
    const {t} = useTranslation();

    const {stateItems, dispatchItems} = useStateItem();

    const toggleShowView = () => {
        const visible = !stateItems.sideItems.visible || stateItems.sideItems.type !== TypeSideItem.view ? true : false;

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SIDE_ITEMS,
            sideItems: {
                visible,
                type: TypeSideItem.view
            }
        });
    };

    const menu = (
        <Menu>
            <Menu.Item>
                <span>
                    <PlusOutlined />
                    <MenuOutlined />
                </span>
                {t('select-view.add-view-list')}
            </Menu.Item>
            <Menu.Item>
                <span>
                    <PlusOutlined />
                    <AppstoreFilled />
                </span>
                {t('select-view.add-view-tile')}
            </Menu.Item>
        </Menu>
    );

    return (
        <DropdownButton overlay={menu}>
            <InnerDropdown onClick={toggleShowView} color={stateItems.view.current?.color}>
                {stateItems.view.current?.text ?? t('select-view.default-view')}
            </InnerDropdown>
        </DropdownButton>
    );
}

export default SelectView;
