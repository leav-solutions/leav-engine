// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {List as AntdList, ListProps} from 'antd';
import Checkbox, {CheckboxChangeEvent} from 'antd/lib/checkbox/Checkbox';
import React from 'react';
import styled from 'styled-components';
import themingVar from 'themingVar';

interface IListProps<D> extends Omit<ListProps<D>, 'renderItem'> {
    maxHeight?: number | string;
    dataSource: D[];
    renderItemContent?: (item: D) => JSX.Element;
    onItemClick?: (item: D) => void;
    selectable?: boolean;
    selectedItems?: D[];
    onSelectionChange?: (selectedItems: D[]) => void;
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
    && {
        padding: 0;
        justify-content: flex-start;
    }
`;

const CheckboxWrapper = styled.div`
    margin: 0 1em;
`;

function List({
    maxHeight,
    onItemClick,
    renderItemContent,
    selectable,
    selectedItems,
    onSelectionChange,
    ...listProps
}: IListProps<any>): JSX.Element {
    const props = {
        renderItem: item => {
            const _handleClick = onItemClick
                ? () => {
                      onItemClick(item);
                  }
                : null;

            const _handleCheck = (e: CheckboxChangeEvent) => {
                const newSelection = [...selectedItems];
                if (e.target.checked) {
                    newSelection.push(item);
                } else {
                    newSelection.splice(newSelection.indexOf(item), 1);
                }
                onSelectionChange(newSelection);
            };

            return (
                <ListItem onClick={_handleClick}>
                    {selectable && (
                        <CheckboxWrapper onClick={e => e.stopPropagation()}>
                            <Checkbox checked={selectedItems.indexOf(item) !== -1} onChange={_handleCheck} />
                        </CheckboxWrapper>
                    )}
                    {renderItemContent ? renderItemContent(item) : item}
                </ListItem>
            );
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
