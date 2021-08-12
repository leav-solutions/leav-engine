// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {List as AntdList, ListProps} from 'antd';
import React from 'react';
import styled from 'styled-components';
import themingVar from 'themingVar';

interface IListProps<D> extends ListProps<D> {
    maxHeight?: number | string;
    dataSource: D[];
    onItemClick?: (item: D) => void;
}

const Wrapper = styled.div<{maxHeight: string}>`
    background-color: ${themingVar['@default-bg']};
    border-radius: 5px;

    .ant-list-items {
        max-height: ${p => p.maxHeight || 'auto'};
        overflow-y: auto;
    }
`;

const ListItem = styled(AntdList.Item)<{onClick: any}>`
    cursor: ${p => (p.onClick ? 'pointer' : 'auto')};
`;

function List({maxHeight, onItemClick, ...listProps}: IListProps<any>): JSX.Element {
    const props = {
        renderItem: item => {
            const _handleClick = onItemClick ? () => onItemClick(item) : null;
            return <ListItem onClick={_handleClick}>{item}</ListItem>;
        },
        ...listProps
    };

    const wrapperMaxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : String(maxHeight);

    return (
        <Wrapper maxHeight={wrapperMaxHeight}>
            <AntdList {...props} />
        </Wrapper>
    );
}

export default List;
