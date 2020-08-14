import {DoubleLeftOutlined, DoubleRightOutlined, LeftOutlined, RightOutlined} from '@ant-design/icons';
import {Menu} from 'antd';
import React, {useState} from 'react';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';

interface ILibraryItemsListPaginationProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function LibraryItemsListPagination({stateItems, dispatchItems}: ILibraryItemsListPaginationProps): JSX.Element {
    const first = () =>
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_OFFSET,
            offset: 0
        });

    const previous = () =>
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_OFFSET,
            offset: stateItems.offset >= stateItems.pagination ? stateItems.offset - stateItems.pagination - 1 : 0
        });

    const next = () =>
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_OFFSET,
            offset:
                stateItems.itemsTotalCount && stateItems.offset + stateItems.pagination < stateItems.itemsTotalCount
                    ? stateItems.offset + stateItems.pagination - 1
                    : stateItems.offset
        });

    const last = () =>
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_OFFSET,
            offset: stateItems.pagination * Math.floor(stateItems.itemsTotalCount / stateItems.pagination)
        });

    return (
        <Menu>
            <Menu.Item icon onClick={first}>
                <DoubleLeftOutlined />
            </Menu.Item>

            <Menu.Item icon onClick={previous}>
                <LeftOutlined />
            </Menu.Item>

            {stateItems.itemsTotalCount
                ? [...Array(Math.ceil(stateItems.itemsTotalCount / stateItems.pagination))].map((e, index) => {
                      const activePage = Math.round(stateItems.offset / stateItems.pagination);

                      // change the number of items around the current page display
                      const range = 2;

                      const isActive = activePage === index;

                      if (index < activePage - range || index > activePage + range) {
                          return <span key={index}></span>;
                      }

                      return (
                          <Menu.Item
                              key={index}
                              active={isActive}
                              onClick={() =>
                                  !isActive &&
                                  dispatchItems({
                                      type: LibraryItemListReducerActionTypes.SET_OFFSET,
                                      offset: index * stateItems.pagination
                                  })
                              }
                          >
                              {isActive ? (
                                  <InputValue index={index} stateItems={stateItems} dispatchItems={dispatchItems} />
                              ) : (
                                  index + 1
                              )}
                          </Menu.Item>
                      );
                  })
                : ''}

            <Menu.Item icon onClick={next}>
                <RightOutlined />
            </Menu.Item>
            <Menu.Item icon onClick={last}>
                <DoubleRightOutlined />
            </Menu.Item>
        </Menu>
    );
}

interface InputValueProps {
    index: number;
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

const InputValue = ({index, stateItems, dispatchItems}: InputValueProps) => {
    const [value, setValue] = useState<number>(index + 1);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(parseInt(newValue));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newOffSet = (value - 1) * stateItems.pagination;

        if (newOffSet >= 0 && newOffSet <= stateItems.itemsTotalCount) {
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_OFFSET,
                offset: newOffSet
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={value} style={{width: '2rem', padding: '0', textAlign: 'center'}} onChange={handleChange} />
        </form>
    );
};

export default LibraryItemsListPagination;
