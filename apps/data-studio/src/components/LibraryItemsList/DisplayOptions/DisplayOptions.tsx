// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AppstoreFilled, DownOutlined, MenuOutlined} from '@ant-design/icons';
import {Button, Dropdown} from 'antd';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import IconViewType from '../../IconViewType/IconViewType';

const DisplaySizeWrapper = styled.div`
    display: flex;
    justify-content: space-between;

    &&& {
        background: none;
    }
`;

function DisplayOptions(): JSX.Element {
    const {t} = useTranslation();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [visible, setVisible] = useState<boolean>(false);
    const sizes = {
        [ViewSizes.SMALL]: t('items_list.display.small'),
        [ViewSizes.MEDIUM]: t('items_list.display.medium'),
        [ViewSizes.BIG]: t('items_list.display.big')
    };

    enum SizeAction {
        LESS = 'LESS',
        MORE = 'MORE'
    }

    const _handleChangeType = (type: ViewTypes) => {
        searchDispatch({
            type: SearchActionTypes.SET_DISPLAY,
            display: {type, size: searchState.display.size}
        });
    };

    const _handleChangeSize = (action: SizeAction) => {
        let idx = Object.keys(sizes).indexOf(searchState.display.size);
        idx = action === SizeAction.LESS ? idx - 1 : idx + 1;
        idx = idx < 0 ? 0 : idx > 2 ? 2 : idx;

        searchDispatch({
            type: SearchActionTypes.SET_DISPLAY,
            display: {type: searchState.display.type, size: ViewSizes[Object.keys(sizes)[idx]]}
        });
    };

    const _handleOpenChange = () => setVisible(!visible);

    const menu = {
        style: {minWidth: '11em'},
        items: [
            {
                key: 'display_size',
                label: (
                    <DisplaySizeWrapper>
                        <Button
                            shape="circle"
                            disabled={searchState.display.size === ViewSizes.SMALL}
                            onClick={() => _handleChangeSize(SizeAction.LESS)}
                            size="small"
                        >
                            -
                        </Button>
                        {` ${sizes[searchState.display.size]} `}
                        <Button
                            shape="circle"
                            disabled={searchState.display.size === ViewSizes.BIG}
                            onClick={() => _handleChangeSize(SizeAction.MORE)}
                            size="small"
                        >
                            +
                        </Button>
                    </DisplaySizeWrapper>
                )
            },
            {
                type: 'divider',
                key: 'divider'
            },
            {
                key: 'display_list',
                label: t('view.type-list'),
                onClick: () => _handleChangeType(ViewTypes.list),
                icon: <MenuOutlined />
            },
            {
                key: 'display_cards',
                label: t('view.type-cards'),
                onClick: () => _handleChangeType(ViewTypes.cards),
                icon: <AppstoreFilled />
            }
        ]
    };

    return (
        <Dropdown
            open={visible}
            onOpenChange={_handleOpenChange}
            trigger={['click']}
            placement="bottomRight"
            menu={menu}
        >
            <Button>
                <IconViewType type={searchState.display.type} />
                <DownOutlined />
            </Button>
        </Dropdown>
    );
}

export default DisplayOptions;
