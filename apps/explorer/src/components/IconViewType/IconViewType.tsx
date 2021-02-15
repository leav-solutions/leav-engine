// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AppstoreFilled, CalendarOutlined} from '@ant-design/icons';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IconViewList} from '../../assets/icons/IconViewList';
import {ViewType} from '../../_types/types';

const Wrapper = styled.div`
    display: inline-flex;
    align-items: center;

    & > *:nth-child(2) {
        margin-left: 8px;
    }
`;

interface IIconViewTypeProps {
    type: ViewType;
    showDescription?: boolean;
}

const IconViewType = ({type, showDescription}: IIconViewTypeProps) => {
    const {t} = useTranslation();
    switch (type) {
        case ViewType.list:
            return (
                <Wrapper>
                    <IconViewList /> <span>{showDescription && t('view.type-list')}</span>
                </Wrapper>
            );
        case ViewType.cards:
            return (
                <Wrapper>
                    <AppstoreFilled /> <span>{showDescription && t('view.type-cards')}</span>
                </Wrapper>
            );
        case ViewType.timeline:
            return (
                <Wrapper>
                    <CalendarOutlined /> <span>{showDescription && t('view.type-timeline')}</span>
                </Wrapper>
            );
    }
};

export default IconViewType;
