// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined, MenuOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {setDisplaySize} from 'redux/display';
import {RootDispatch, RootState} from 'redux/store';
import styled from 'styled-components';
import {DisplaySize} from '../../../_types/types';

const ListSmallIcon = styled(MenuOutlined)`
    transform: scale(0.7);
`;

const ListBigIcon = styled(MenuOutlined)`
    transform: scale(1.3);
`;

const CustomButton = styled(Button)`
    padding: 0.3rem;
`;

function DisplayOptions(): JSX.Element {
    const {t} = useTranslation();

    const displayOptions = [
        {
            key: 'list-small',
            text: t('items_list.display.list-small'),
            value: DisplaySize.small,
            icon: <ListSmallIcon />
        },
        {
            key: 'list-medium',
            text: t('items_list.display.list-medium'),
            value: DisplaySize.medium,
            icon: <MenuOutlined />
        },
        {
            key: 'list-big',
            text: t('items_list.display.list-big'),
            value: DisplaySize.big,
            icon: <ListBigIcon />
        }
    ];

    const size = useSelector<RootState>(state => state.display.size);
    const dispatch = useDispatch<RootDispatch>();

    const [currentDisplayOption, setCurrentDisplayOption] = useState(
        displayOptions.find(displayOption => displayOption.value === size)
    );

    const changeDisplay = (value: string) => {
        const newDisplay = value?.toString();

        // check if `newDisplay` is in DisplaySize
        if (newDisplay && Object.values(DisplaySize).includes(newDisplay as any)) {
            dispatch(setDisplaySize(newDisplay as any));
        }

        const newCurrentDisplayOption = displayOptions.find(displayOption => displayOption.value === newDisplay);
        setCurrentDisplayOption(newCurrentDisplayOption);
    };

    return (
        <Dropdown
            overlay={
                <Menu>
                    {displayOptions.map(displayOption => (
                        <Menu.Item key={displayOption.key} onClick={() => changeDisplay(displayOption.value)}>
                            <span>{displayOption.icon}</span>
                            {displayOption.text}
                        </Menu.Item>
                    ))}
                </Menu>
            }
        >
            <CustomButton title={currentDisplayOption?.text}>
                {currentDisplayOption?.icon}
                <DownOutlined />
            </CustomButton>
        </Dropdown>
    );
}

export default DisplayOptions;
