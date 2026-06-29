import {AppstoreFilled, CalendarOutlined, MenuOutlined} from '@ant-design/icons';
import {type CSSProperties} from 'react';
import {ViewTypes} from '../../_gqlTypes';

interface IIconViewTypeProps {
    style?: CSSProperties;
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
