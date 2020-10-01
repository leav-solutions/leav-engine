/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {DragLayer} from 'react-dnd';
import ALCCard from '../ALCCard';

const layerStyles = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%'
};

const getFieldStyle = isDragging => {
    const style = {
        //width: 300,
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

class BinDragLayer extends Component {
    static propTypes = {
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

    static defaultProps = {};

    renderItem = (type, item) => {
        if (item) {
            const connectionState =
                item.connectionState === undefined ? 'neutral' : item.connectionState ? 'connected' : 'disconnected';
            const colorTypeDictionnary = item.colorTypeDictionnary;
            const width = item.width;
            return (
                <div style={{pointerEvents: 'none', width: `${width}px`}}>
                    <ALCCard
                        key={item.id}
                        id={`${item.id}`}
                        action={item.action}
                        findCard={() => {
                            return {index: item.id};
                        }}
                        origin={item.origin}
                        connectionState={connectionState}
                        colorTypeDictionnary={colorTypeDictionnary}
                        dragging
                    />
                </div>
            );
        }
    };

    render() {
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

export default DragLayer(collect)(BinDragLayer);
