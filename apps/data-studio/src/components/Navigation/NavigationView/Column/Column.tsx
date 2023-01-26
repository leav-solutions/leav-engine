// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery, useSubscription} from '@apollo/client';
import {themeVars} from '@leav/ui';
import {Pagination} from 'antd';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {treeNavigationPageSize} from 'constants/constants';
import {treeNodeChildrenQuery} from 'graphQL/queries/trees/getTreeNodeChildren';
import {getTreeEvents} from 'graphQL/subscribes/trees/getTreeEvents';
import {useActiveTree} from 'hooks/ActiveTreeHook/ActiveTreeHook';
import {createRef, useEffect, useState} from 'react';
import {setNavigationPath} from 'redux/navigation';
import {INavigationElement} from 'redux/stateType';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {TREE_EVENTS, TREE_EVENTSVariables} from '_gqlTypes/TREE_EVENTS';
import {TREE_NODE_CHILDREN, TREE_NODE_CHILDRENVariables} from '_gqlTypes/TREE_NODE_CHILDREN';
import DetailNavigation from './DetailNavigation';
import HeaderColumnNavigation from './HeaderColumnNavigation';
import Row from './Row';

const ColumnWrapper = styled.div<{showDetails: boolean}>`
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
    treeElement?: INavigationElement;
    depth: number;
    isActive: boolean;
}

const Column = ({treeElement, depth, isActive: columnActive}: IColumnProps) => {
    const [activeTree] = useActiveTree();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);

    const dispatch = useAppDispatch();
    const {navigation} = useAppSelector(state => ({
        navigation: state.navigation
    }));

    const queryVariables = {
        treeId: activeTree?.id,
        node: treeElement?.id ?? null,
        pagination: {
            limit: treeNavigationPageSize,
            offset: (currentPage - 1) * treeNavigationPageSize
        }
    };
    const {loading, error, data, refetch, called} = useQuery<TREE_NODE_CHILDREN, TREE_NODE_CHILDRENVariables>(
        treeNodeChildrenQuery,
        {
            variables: queryVariables,
            onCompleted: res => {
                setTotalCount(res.treeNodeChildren.totalCount);
            },
            skip: !activeTree
        }
    );

    useSubscription<TREE_EVENTS, TREE_EVENTSVariables>(getTreeEvents, {
        variables: {filters: {ignoreOwnEvents: true, treeId: activeTree?.id, nodes: [treeElement?.id ?? null]}},
        skip: !activeTree?.id || loading,
        onSubscriptionData() {
            // We known something happened concerning this node.
            // To make sure everything is clean and up to date, we just refetch data
            refetch(queryVariables);
        }
    });

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

    const _handleCloseDetails = () => {
        const indexInPath = navigation.path.findIndex(p => p.id === treeElement?.id);
        const newPath = [...navigation.path];
        newPath[indexInPath] = {...treeElement, showDetails: false};

        dispatch(setNavigationPath(newPath));
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
            {canDisplayContent && showDetails && (
                <DetailNavigation
                    treeElement={treeElement}
                    closable={!!treeElement?.childrenCount}
                    onClose={_handleCloseDetails}
                />
            )}
            {canDisplayContent && (
                <>
                    {totalCount > treeNavigationPageSize && (
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
        </ColumnWrapper>
    );
};

export default Column;
