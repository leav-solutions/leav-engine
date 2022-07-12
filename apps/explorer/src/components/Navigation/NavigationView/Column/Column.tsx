// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {Pagination} from 'antd';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {treeNavigationPageSize} from 'constants/constants';
import {treeNodeChildrenQuery} from 'graphQL/queries/trees/getTreeNodeChildren';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import React, {createRef, useEffect, useState} from 'react';
import {INavigationElement} from 'redux/stateType';
import styled from 'styled-components';
import {TREE_NODE_CHILDREN, TREE_NODE_CHILDRENVariables} from '_gqlTypes/TREE_NODE_CHILDREN';
import themingVar from '../../../../themingVar';
import DetailNavigation from './DetailNavigation';
import HeaderColumnNavigation from './HeaderColumnNavigation';
import Row from './Row';

const ColumnWrapper = styled.div<{showDetails: boolean}>`
    border-right: 1px solid ${themingVar['@divider-color']};
    width: ${p =>
        p.showDetails
            ? themingVar['@leav-navigation-column-details-width']
            : themingVar['@leav-navigation-column-width']};
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    flex-shrink: 0;

    background: ${themingVar['@default-bg']};
`;

const ColumnContent = styled.div`
    overflow-y: auto;
    height: 100%;
`;

const ColumnPagination = styled(Pagination)`
    && {
        text-align: center;
        padding: 0.5em 0;
        border-bottom: 1px solid ${themingVar['@border-color-base']};
    }
`;

interface IColumnProps {
    treeElement?: INavigationElement;
    depth: number;
    isActive: boolean;
}

const Column = ({treeElement, depth, isActive: columnActive}: IColumnProps) => {
    const [activeTree] = useActiveTree();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);

    const queryVariables = {
        treeId: activeTree?.id,
        node: treeElement?.id ?? null,
        pagination: {
            limit: treeNavigationPageSize,
            offset: (currentPage - 1) * treeNavigationPageSize
        }
    };
    const {loading, error, data, refetch, called} = useQuery<TREE_NODE_CHILDREN, TREE_NODE_CHILDRENVariables>(
        treeNodeChildrenQuery(true),
        {
            variables: queryVariables,
            onCompleted: res => {
                setTotalCount(res.treeNodeChildren.totalCount);
            },
            skip: !activeTree
        }
    );

    const ref = createRef<HTMLDivElement>();

    useEffect(() => {
        if (ref?.current?.scrollIntoView && columnActive) {
            ref.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }, [ref, columnActive]);

    useEffect(() => {
        if (!activeTree || !called) {
            return;
        }

        refetch(queryVariables);
    }, [currentPage]);

    const children = data?.treeNodeChildren.list ?? [];
    const canDisplayContent = !error;
    const showDetails = treeElement && ((!loading && !totalCount) || treeElement.showDetails);

    const _handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <ColumnWrapper
            ref={ref}
            data-testid={`navigation-column${showDetails ? '-with-details' : ''}`}
            showDetails={showDetails}
        >
            <HeaderColumnNavigation
                depth={depth}
                treeElement={treeElement}
                isActive={columnActive}
                isDetail={showDetails}
                children={children}
            />
            {error && <ErrorDisplay message={error.message} />}
            {canDisplayContent && !showDetails && (
                <>
                    {totalCount > treeNavigationPageSize && columnActive && (
                        <ColumnPagination
                            simple
                            current={currentPage}
                            total={totalCount}
                            onChange={_handlePageChange}
                            pageSize={treeNavigationPageSize}
                        />
                    )}
                    {loading ? (
                        <Loading />
                    ) : (
                        <ColumnContent>
                            {children.map(child => (
                                <Row key={child.id} treeElement={child} depth={depth} isActive={columnActive} />
                            ))}
                        </ColumnContent>
                    )}
                </>
            )}
            {canDisplayContent && showDetails && <DetailNavigation treeElement={treeElement} />}
        </ColumnWrapper>
    );
};

export default Column;
