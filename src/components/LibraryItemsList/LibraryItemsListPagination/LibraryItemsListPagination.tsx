import React, {useState} from 'react';
import {Icon, Menu} from 'semantic-ui-react';

interface ILibraryItemsListPaginationProps {
    totalCount: number;
    pagination: number;
    offset: number;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
}

function LibraryItemsListPagination({
    totalCount,
    pagination,
    offset,
    setOffset
}: ILibraryItemsListPaginationProps): JSX.Element {
    const first = () => setOffset(0);
    const previous = () => setOffset(offset => (offset >= pagination ? offset - pagination - 1 : 0));

    const next = () =>
        setOffset(offset => (totalCount && offset + pagination < totalCount ? offset + pagination - 1 : offset));

    const last = () => setOffset(pagination * Math.floor(totalCount / pagination));

    return (
        <>
            <Menu.Item as="a" icon onClick={first}>
                <Icon name="angle double left" />
            </Menu.Item>

            <Menu.Item as="a" icon onClick={previous}>
                <Icon name="angle left" />
            </Menu.Item>

            {totalCount
                ? [...Array(Math.ceil(totalCount / pagination))].map((e, index) => {
                      const activePage = Math.round(offset / pagination);

                      // change the number of items around the current page display
                      const range = 2;

                      const isActive = activePage === index;

                      if (index < activePage - range || index > activePage + range) {
                          return <span key={index}></span>;
                      }

                      return (
                          <Menu.Item
                              key={index}
                              as="a"
                              active={isActive}
                              onClick={() => !isActive && setOffset(index * pagination)}
                          >
                              {isActive ? (
                                  <InputValue
                                      index={index}
                                      setOffset={setOffset}
                                      pagination={pagination}
                                      totalCount={totalCount}
                                  />
                              ) : (
                                  index + 1
                              )}
                          </Menu.Item>
                      );
                  })
                : ''}

            <Menu.Item as="a" icon onClick={next}>
                <Icon name="angle right" />
            </Menu.Item>
            <Menu.Item as="a" icon onClick={last}>
                <Icon name="angle double right" />
            </Menu.Item>
        </>
    );
}

const InputValue = ({index, setOffset, pagination, totalCount}: any) => {
    const [value, setValue] = useState(index + 1);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newOffSet = (parseInt(value) - 1) * pagination;

        if (newOffSet >= 0 && newOffSet <= totalCount) {
            setOffset(newOffSet);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={value} style={{width: '2rem', padding: '0', textAlign: 'center'}} onChange={handleChange} />
        </form>
    );
};

export default LibraryItemsListPagination;
