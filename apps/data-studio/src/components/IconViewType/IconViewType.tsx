// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AppstoreFilled, CalendarOutlined, MenuOutlined} from '@ant-design/icons';
import React from 'react';
import {ViewTypes} from '_gqlTypes/globalTypes';

interface IIconViewTypeProps {
    style?: React.CSSProperties;
    type: ViewTypes;
}

const IconViewType = ({type, style}: IIconViewTypeProps) => {
    switch (type) {
        case ViewTypes.list:
            return <MenuOutlined style={style} />;
        case ViewTypes.cards:
            return <AppstoreFilled style={style} />;
        case ViewTypes.timeline:
            return <CalendarOutlined style={style} />;
    }
};

export default IconViewType;
