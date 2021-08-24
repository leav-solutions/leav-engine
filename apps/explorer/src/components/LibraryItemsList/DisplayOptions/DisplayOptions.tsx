// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined, MenuOutlined, AppstoreFilled} from '@ant-design/icons';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import {Button, Dropdown, Menu} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {setDisplaySize} from 'redux/display';
import {RootDispatch, RootState} from 'redux/store';
import styled from 'styled-components';
import {DisplaySize} from '../../../_types/types';
import {ViewTypes} from '_gqlTypes/globalTypes';

const ListSmallIcon = styled(MenuOutlined)`
    transform: scale(0.7);
`;

const ListBigIcon = styled(MenuOutlined)`
    transform: scale(1.3);
`;

const CardsMediumIcon = styled(AppstoreFilled)`
    transform: scale(1);
`;

const CustomButton = styled(Button)`
    padding: 0.3rem;
`;

function DisplayOptions(): JSX.Element {
    const {t} = useTranslation();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const displayOptions = [
        {
            key: 'list-small',
            text: t('items_list.display.list-small'),
            size: DisplaySize.small,
            type: ViewTypes.list,
            icon: <ListSmallIcon />
        },
        {
            key: 'list-medium',
            text: t('items_list.display.list-medium'),
            size: DisplaySize.medium,
            type: ViewTypes.list,
            icon: <MenuOutlined />
        },
        {
            key: 'list-big',
            text: t('items_list.display.list-big'),
            size: DisplaySize.big,
            type: ViewTypes.list,
            icon: <ListBigIcon />
        },
        {
            key: 'cards-medium',
            text: t('items_list.display.cards'),
            size: DisplaySize.medium,
            type: ViewTypes.cards,
            icon: <CardsMediumIcon />
        }
    ];

    const size = useSelector<RootState>(state => state.display.size);
    const dispatch = useDispatch<RootDispatch>();

    const [currentDisplayOption, setCurrentDisplayOption] = useState(
        displayOptions.find(displayOption => displayOption.size === size)
    );

    const changeDisplay = opt => {
        const newSize = opt.size?.toString();

        // check if `newDisplay` is in DisplaySize
        if (newSize && Object.values(DisplaySize).includes(newSize as any)) {
            dispatch(setDisplaySize(newSize as any));
        }

        const newCurrentDisplayOption = displayOptions.find(
            displayOption => displayOption.size === newSize && displayOption.type === opt.type
        );

        setCurrentDisplayOption(newCurrentDisplayOption);

        searchDispatch({
            type: SearchActionTypes.SET_DISPLAY_TYPE,
            displayType: opt.type
        });
    };

    return (
        <Dropdown
            overlay={
                <Menu>
                    {displayOptions.map(displayOption => (
                        <Menu.Item key={displayOption.key} onClick={() => changeDisplay(displayOption)}>
                            <span>{displayOption.icon}</span>
                            {displayOption.text}
                        </Menu.Item>
                    ))}
                </Menu>
            }
        >
            <CustomButton title={currentDisplayOption?.text}>
                {
                    displayOptions.find(o => {
                        return searchState.displayType === ViewTypes.list
                            ? o.type === searchState.displayType && currentDisplayOption.size === o.size
                            : o.type === searchState.displayType;
                    }).icon
                }
                <DownOutlined />
            </CustomButton>
        </Dropdown>
    );
}

export default DisplayOptions;
