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
    const previous = () => setOffset(offset => (offset >= pagination ? offset - pagination : 0));

    const next = () =>
        setOffset(offset => (totalCount && offset + pagination < totalCount ? offset + pagination : offset));

    return (
        <>
            <Menu.Item as="a" icon onClick={previous}>
                <Icon name="chevron left" />
            </Menu.Item>

            {totalCount
                ? [...Array(Math.ceil(totalCount / pagination))].map((e, index) => {
                      const activePage = Math.round(offset / pagination);
                      const range = 2;

                      const isActive = activePage === index;

                      if (index < activePage - range || index > activePage + range) {
                          return <span key={index}></span>;
                      }

                      return (
                          <Menu.Item key={index} as="a" active={isActive} onClick={() => setOffset(index * pagination)}>
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
                <Icon name="chevron right" />
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

        if (newOffSet > 0 && newOffSet <= totalCount) {
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
