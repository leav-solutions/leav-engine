import {ShareAltOutlined} from '@ant-design/icons';
import {type CSSProperties} from 'react';

interface ITreeIconProps {
    style?: CSSProperties;
    [key: string]: any; // antd doesn't provide a usable type for icon props
}

function TreeIcon({style, ...props}: ITreeIconProps): JSX.Element {
    return <ShareAltOutlined style={{...style, transform: 'rotate(90deg)'}} {...props} />;
}

export default TreeIcon;
