import {AppstoreFilled, CalendarOutlined, MenuOutlined} from '@ant-design/icons';
import React from 'react';
import {ViewTypes} from '../../_gqlTypes';

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
