// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';

export const DEFAULT_CURRENT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;

export const usePagination = () => {
    const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (_page: number, size: number) => {
        setPageSize(size);
        setCurrentPage(DEFAULT_CURRENT_PAGE);
    };

    const resetPage = () => {
        setCurrentPage(DEFAULT_CURRENT_PAGE);
    };

    return {
        currentPage,
        pageSize,
        handlePageChange,
        handlePageSizeChange,
        resetPage,
    };
};
