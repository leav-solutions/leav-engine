// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import PropTypes from 'prop-types';
import {Component, CSSProperties} from 'react';
import {DragLayer} from 'react-dnd';
import ALCCard from '../ALCCard';

const layerStyles: CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%'
};

const getFieldStyle = isDragging => {
    const style: CSSProperties = {
        maxWidth: 300
    };
    style.opacity = isDragging ? 0.8 : 1;
    return style;
};

const getItemStyles = props => {
    const {currentOffset} = props;
    if (!currentOffset) {
        return {
            display: 'none'
        };
    }

    const {x, y} = currentOffset;

    const transform = `translate(${x}px, ${y}px)`;

    return {
        transform,
        WebkitTransform: transform
    };
};

const collect = monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    initialOffset: monitor.getInitialClientOffset(),
    diff: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging()
});

interface IBinDragLayerProps {
    item: any;
    itemType: string;
    initialOffset: {
        x: number;
        y: number;
    };
    currentOffset: {
        x: number;
        y: number;
    };
    isDragging: boolean;
}

class BinDragLayer extends Component<IBinDragLayerProps> {
    public static propTypes = {
        item: PropTypes.object,
        itemType: PropTypes.string,
        initialOffset: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }),
        currentOffset: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }),
        isDragging: PropTypes.bool.isRequired
    };

    public static defaultProps = {};

    private renderItem = (type, item) => {
        if (item) {
            const colorTypeDictionnary = item.colorTypeDictionnary;
            const width = item.width;
            return (
                <div style={{pointerEvents: 'none', width: `${width}px`}}>
                    <ALCCard
                        key={item.id}
                        id={item.id}
                        action={item.action}
                        findCard={() => item.id}
                        origin={item.origin}
                        colorTypeDictionnary={colorTypeDictionnary}
                        dragging
                    />
                </div>
            );
        }
    };

    public render() {
        const {item, itemType, isDragging} = this.props;
        return (
            <div style={layerStyles}>
                <div style={getItemStyles(this.props)}>
                    <div style={getFieldStyle(isDragging)}>{this.renderItem(itemType, item)}</div>
                </div>
            </div>
        );
    }
}

const BinDragLayerComp = DragLayer(collect)(BinDragLayer as any);
export default BinDragLayerComp;
