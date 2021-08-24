// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import {Badge, Input, Spin} from 'antd';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {DragDropContext, Draggable, Droppable, DropResult, ResponderProvided} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '_gqlTypes/SAVE_USER_DATA';
import {
    getViewsListQuery,
    IGetViewListQuery,
    IGetViewListSort,
    IGetViewListVariables
} from '../../../graphQL/queries/views/getViewsListQuery';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {useUser} from '../../../hooks/UserHook/UserHook';
import themingVar from '../../../themingVar';
import {localizedTranslation} from '../../../utils';
import {IView} from '../../../_types/types';
import {getFiltersFromRequest} from '../FiltersPanel/getFiltersFromRequest';
import EditView from './EditView';
import View from './View';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    border-right: ${themingVar['@divider-color']} 1px solid;
    overflow-y: auto;
`;

const Header = styled.div`
    width: 100%;
    background-color: ${themingVar['@leav-secondary-bg']};
    display: grid;
    align-items: center;
    padding: 0.3rem 0.3rem 0.3rem 1rem;
    font-weight: 700;
    border-bottom: 1px solid ${themingVar['@divider-color']};
`;

const SubHeader = styled.div`
    width: 100%;
    border-top: ${themingVar['@item-active-bg']} 1px solid;
    border-bottom: ${themingVar['@item-active-bg']} 1px solid;
    padding: 0.3rem;
    padding-left: 1rem;
    font-weight: 700;
    font-size: 14px;
`;

const Views = styled.div`
    width: 100%;
`;

const SearchWrapper = styled.div`
    margin: 1rem;
`;

const CustomBadge = styled(Badge)`
    margin-left: 8px;
    && > * {
        background-color: ${themingVar['@divider-color']};
        color: ${themingVar['@default-text-color']};
    }
`;

function ViewPanel(): JSX.Element {
    const {t} = useTranslation();
    const [user] = useUser();
    const [{lang}] = useLang();

    const [search, setSearch] = useState('');

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [editView, setEditView] = useState<IView | false>(false);

    const USER_VIEWS_ORDER_KEY = 'user_views_order_' + searchState.library.id;
    const SHARED_VIEWS_ORDER_KEY = 'shared_views_order_' + searchState.library.id;

    const {data, loading, error, refetch} = useQuery<IGetViewListQuery, IGetViewListVariables>(getViewsListQuery, {
        variables: {
            libraryId: searchState.library.id || ''
        }
    });

    const orderDataQuery = useQuery(getUserDataQuery, {
        variables: {keys: [USER_VIEWS_ORDER_KEY, SHARED_VIEWS_ORDER_KEY]},
        onCompleted: d => {
            searchDispatch({
                type: SearchActionTypes.SET_USER_VIEWS_ORDER,
                userViewsOrder: d.userData?.data[USER_VIEWS_ORDER_KEY] || []
            });
            searchDispatch({
                type: SearchActionTypes.SET_SHARED_VIEWS_ORDER,
                sharedViewsOrder: d.userData?.data[SHARED_VIEWS_ORDER_KEY] || []
            });
        }
    });

    const [updateViewsOrderMutation] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData);

    useEffect(() => {
        if (searchState.view.reload) {
            refetch();
        }
    }, [searchState.view, refetch, searchDispatch]);

    if (loading) {
        return (
            <div>
                <Spin />
            </div>
        );
    }

    const _handleSearchSubmit = (value: string) => {
        setSearch(value);
    };

    const {sharedViews, userViews}: {sharedViews: IView[]; userViews: IView[]} = data?.views.list.reduce(
        (acc, view) => {
            const v: IView = {
                ..._.omit(view, ['created_by', '__typename']),
                owner: view.created_by.id === user?.userId,
                filters: Array.isArray(view.filters)
                    ? getFiltersFromRequest(view.filters, searchState.library.id, searchState.attributes)
                    : [],
                sort: _.omit(view.sort, ['__typename']) as IGetViewListSort,
                settings: view.settings?.map(s => _.omit(s, '__typename'))
            };

            if (search && !localizedTranslation(v.label, lang).toUpperCase().includes(search.toUpperCase())) {
                return acc;
            }

            if (v.shared) {
                if (!searchState.sharedViewsOrder.includes(v.id)) {
                    searchDispatch({
                        type: SearchActionTypes.SET_SHARED_VIEWS_ORDER,
                        sharedViewsOrder: [...searchState.sharedViewsOrder, v.id]
                    });
                }

                return {...acc, sharedViews: [...acc.sharedViews, v]};
            }

            if (!searchState.userViewsOrder.includes(v.id)) {
                searchDispatch({
                    type: SearchActionTypes.SET_USER_VIEWS_ORDER,
                    userViewsOrder: [...searchState.userViewsOrder, v.id]
                });
            }

            return {...acc, userViews: [...acc.userViews, v]};
        },
        {sharedViews: [], userViews: []}
    ) ?? {sharedViews: [], userViews: []};

    if (error || orderDataQuery.error) {
        return <ErrorDisplay message={(error || orderDataQuery.error).message} />;
    }

    if (!sharedViews || !userViews) {
        return <ErrorDisplay message={t('error.error_occurred')} />;
    }

    const _showModal = (view: IView) => {
        setEditView(view);
    };

    const _closeModal = () => {
        setEditView(false);
    };

    const onDragEnd = async (result: DropResult, provided: ResponderProvided) => {
        if (!result.destination) {
            return;
        }

        const order =
            result.source.droppableId === 'user' ? [...searchState.userViewsOrder] : [...searchState.sharedViewsOrder];

        const element = order[result.source.index];
        order.splice(result.source.index, 1);
        order.splice(result.destination.index, 0, element);

        searchDispatch(
            result.source.droppableId === 'user'
                ? {type: SearchActionTypes.SET_USER_VIEWS_ORDER, userViewsOrder: order}
                : {type: SearchActionTypes.SET_SHARED_VIEWS_ORDER, sharedViewsOrder: order}
        );

        updateViewsOrderMutation({
            variables: {
                key: USER_VIEWS_ORDER_KEY,
                value: searchState.userViewsOrder,
                global: false
            }
        });
    };

    return (
        <Wrapper>
            {editView && <EditView view={editView} visible={!!editView} onClose={_closeModal} />}
            <Header>{t('view.list')}</Header>
            <SearchWrapper>
                <Input.Search onSearch={_handleSearchSubmit} />
            </SearchWrapper>

            <SubHeader>
                {t('view.shared-views')}
                <CustomBadge count={sharedViews.length} />
            </SubHeader>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={'shared'}>
                    {providedDroppable => (
                        <Views {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                            {sharedViews
                                .sort(
                                    (a, b) =>
                                        searchState.sharedViewsOrder.indexOf(a.id) -
                                        searchState.sharedViewsOrder.indexOf(b.id)
                                )
                                .map((view, idx) => (
                                    <Draggable key={idx} draggableId={idx.toString()} index={idx}>
                                        {provided => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <View
                                                    key={view.id}
                                                    view={view}
                                                    onEdit={() => _showModal(view)}
                                                    handleProps={provided.dragHandleProps}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                            {providedDroppable.placeholder}
                        </Views>
                    )}
                </Droppable>
            </DragDropContext>

            <SubHeader>
                {t('view.my-views')}
                <CustomBadge count={userViews.length} />
            </SubHeader>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={'user'}>
                    {providedDroppable => (
                        <Views {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                            {userViews
                                .sort(
                                    (a, b) =>
                                        searchState.userViewsOrder.indexOf(a.id) -
                                        searchState.userViewsOrder.indexOf(b.id)
                                )
                                .map((view, idx) => (
                                    <Draggable key={idx} draggableId={idx.toString()} index={idx}>
                                        {provided => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <View
                                                    key={view.id}
                                                    view={view}
                                                    onEdit={() => _showModal(view)}
                                                    handleProps={provided.dragHandleProps}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                            {providedDroppable.placeholder}
                        </Views>
                    )}
                </Droppable>
            </DragDropContext>
        </Wrapper>
    );
}

export default ViewPanel;
