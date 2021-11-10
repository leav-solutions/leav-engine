// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined, MenuOutlined, AppstoreFilled} from '@ant-design/icons';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {Button, Dropdown, Menu} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ViewTypes, ViewSizes} from '_gqlTypes/globalTypes';

const CustomButton = styled(Button)`
    padding: 0.3rem;
`;

const CustomMenu = styled(Menu)``;

function DisplayOptions(): JSX.Element {
    const {t} = useTranslation();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const sizes = {
        [ViewSizes.SMALL]: t('items_list.display.small'),
        [ViewSizes.MEDIUM]: t('items_list.display.medium'),
        [ViewSizes.BIG]: t('items_list.display.big')
    };

    enum SizeAction {
        LESS = 'LESS',
        MORE = 'MORE'
    }

    const changeType = (type: ViewTypes) => {
        searchDispatch({
            type: SearchActionTypes.SET_DISPLAY,
            display: {type, size: searchState.display.size}
        });
    };

    const changeSize = (action: SizeAction) => {
        let idx = Object.keys(sizes).indexOf(searchState.display.size);
        idx = action === SizeAction.LESS ? idx - 1 : idx + 1;
        idx = idx < 0 ? 0 : idx > 2 ? 2 : idx;

        searchDispatch({
            type: SearchActionTypes.SET_DISPLAY,
            display: {type: searchState.display.type, size: ViewSizes[Object.keys(sizes)[idx]]}
        });
    };

    return (
        <Dropdown
            overlay={
                <CustomMenu>
                    {
                        <Menu.Item>
                            <Button
                                shape="circle"
                                disabled={searchState.display.size === ViewSizes.SMALL}
                                onClick={() => changeSize(SizeAction.LESS)}
                                size="small"
                            >
                                -
                            </Button>
                            {` ${sizes[searchState.display.size]} `}
                            <Button
                                shape="circle"
                                disabled={searchState.display.size === ViewSizes.BIG}
                                onClick={() => changeSize(SizeAction.MORE)}
                                size="small"
                            >
                                +
                            </Button>
                        </Menu.Item>
                    }
                    <Menu.Divider />
                    <Menu.Item onClick={() => changeType(ViewTypes.list)} icon={<MenuOutlined />}>
                        {t('view.type-list')}
                    </Menu.Item>
                    <Menu.Item onClick={() => changeType(ViewTypes.cards)} icon={<AppstoreFilled />}>
                        {t('view.type-cards')}
                    </Menu.Item>
                </CustomMenu>
            }
        >
            <CustomButton title={sizes[searchState.display.size]}>
                {searchState.display.type === ViewTypes.list ? <MenuOutlined /> : <AppstoreFilled />}
                <DownOutlined />
            </CustomButton>
        </Dropdown>
    );
}

export default DisplayOptions;
