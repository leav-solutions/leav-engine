import {type FunctionComponent, useEffect, useRef, useState} from 'react';
import {ErrorDisplay, Loading, themeVars} from '@leav/ui';
import {Pagination} from 'antd';
import styled from 'styled-components';
import {useGetTreeNodeChildrenQuery, useTreeEventsSubscription} from '../../../__generated__';
import {TREE_NAVIGATION_PAGE_SIZE} from '../constants';
import {type INavigationElement} from '../_types';
import {useTreeExplorerState} from '../store/useTreeExplorerState';
import {DetailNavigation} from './DetailNavigation';
import {HeaderColumnNavigation} from './HeaderColumnNavigation';
import {Row} from './Row';

const ColumnWrapper = styled.div`
    border-right: 1px solid ${themeVars.borderLightColor};
    width: ${themeVars.navigationColumnWidth};
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    flex-shrink: 0;

    background: ${themeVars.defaultBg};
`;

const ColumnContent = styled.div`
    overflow-y: auto;
    height: 100%;
`;

const ColumnPagination = styled(Pagination)`
    && {
        text-align: center;
        padding: 0.5em 0;
        border-bottom: 1px solid ${themeVars.borderColor};
    }
`;

interface IColumnProps {
    treeId: string;
    treeElement?: INavigationElement;
    depth: number;
    isActive: boolean;
}

export const Column: FunctionComponent<IColumnProps> = ({treeId, treeElement, depth, isActive: columnActive}) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);

    const {path, setPath} = useTreeExplorerState();

    const queryVariables = {
        treeId,
        node: treeElement?.id ?? null,
        pagination: {
            limit: TREE_NAVIGATION_PAGE_SIZE,
            offset: (currentPage - 1) * TREE_NAVIGATION_PAGE_SIZE,
        },
    };

    const {loading, error, data, refetch} = useGetTreeNodeChildrenQuery({
        variables: queryVariables,
        onCompleted: res => {
            setTotalCount(res.treeNodeChildren.totalCount ?? 0);
        },
    });

    useTreeEventsSubscription({
        variables: {filters: {ignoreOwnEvents: true, treeId, nodes: [treeElement?.id ?? null]}},
        skip: loading,
        onData() {
            // Something happened on this node: refetch to stay consistent.
            refetch(queryVariables);
        },
    });

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref?.current?.scrollIntoView && columnActive) {
            ref.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            });
        }
    }, [columnActive]);

    // No manual refetch on page change: `queryVariables.pagination.offset` derives from `currentPage`,
    // so Apollo re-runs the query automatically when the page changes.

    const children = data?.treeNodeChildren.list ?? [];
    const canDisplayContent = !error;
    const showDetails = treeElement && ((!loading && !totalCount) || treeElement.showDetails);

    const _handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const _handleCloseDetails = () => {
        const indexInPath = path.findIndex(p => p.id === treeElement?.id);
        const newPath = [...path];
        newPath[indexInPath] = {...treeElement, showDetails: false};

        setPath(newPath);
    };

    return (
        <ColumnWrapper ref={ref} data-testid={`navigation-column${showDetails ? '-with-details' : ''}`}>
            <HeaderColumnNavigation
                depth={depth}
                treeElement={treeElement}
                isActive={columnActive}
                isDetail={showDetails}
            >
                {children}
            </HeaderColumnNavigation>
            {error && <ErrorDisplay message={error.message} />}
            {canDisplayContent && showDetails && (
                <DetailNavigation
                    treeElement={treeElement}
                    closable={!!treeElement?.childrenCount}
                    onClose={_handleCloseDetails}
                />
            )}
            {canDisplayContent && (
                <>
                    {totalCount > TREE_NAVIGATION_PAGE_SIZE && (
                        <ColumnPagination
                            simple
                            current={currentPage}
                            total={totalCount}
                            onChange={_handlePageChange}
                            pageSize={TREE_NAVIGATION_PAGE_SIZE}
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
        </ColumnWrapper>
    );
};
