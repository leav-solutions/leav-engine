// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AppstoreFilled, CalendarOutlined, MenuOutlined} from '@ant-design/icons';
import React from 'react';
import {ViewTypes} from '_gqlTypes/globalTypes';

interface IIconViewTypeProps {
    type: ViewTypes;
}

const IconViewType = ({type}: IIconViewTypeProps) => {
    switch (type) {
        case ViewTypes.list:
            return <MenuOutlined />;
        case ViewTypes.cards:
            return <AppstoreFilled />;
        case ViewTypes.timeline:
            return <CalendarOutlined />;
    }
};

export default IconViewType;
