// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {faAngleLeft} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {localizedTranslation} from '@leav/utils';
import {Badge, Button, Input} from 'antd';
import {useState} from 'react';
import {DragDropContext, Draggable, Droppable, DropResult, ResponderProvided} from 'react-beautiful-dnd';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {ErrorDisplay} from '_ui/components/ErrorDisplay';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {SearchActionTypes} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import {Loading} from '_ui/components/Loading';
import {PREFIX_SHARED_VIEWS_ORDER_KEY, PREFIX_USER_VIEWS_ORDER_KEY} from '_ui/constants';
import {useLang} from '_ui/hooks';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useUser} from '_ui/hooks/useUser/useUser';
import {IView} from '_ui/types/views';
import {useGetUserDataQuery, useGetViewsListQuery} from '_ui/_gqlTypes';
import {prepareView} from '_ui/_utils';
import useUpdateViewsOrderMutation from '../hooks/useUpdateViewsOrderMutation';
import EditView from './EditView';
import View from './View';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    border-right: ${themeVars.borderLightColor} 1px solid;
    overflow-y: auto;
`;

const Header = styled.div`
    width: 100%;
    background-color: ${themeVars.headerBg};
    display: grid;
    grid-template-columns: repeat(2, auto);
    justify-content: space-between;
    padding: 0.3rem 0.3rem 0.3rem 1rem;
    font-weight: 700;
    border-bottom: 1px solid ${themeVars.borderLightColor};

    & > * {
        :first-of-type {
            display: grid;
            column-gap: 8px;
            grid-template-columns: repeat(3, auto);
            align-items: center;
            justify-items: center;
        }

        :last-of-type {
            display: grid;
            align-items: center;
            justify-content: flex-end;
            column-gap: 8px;
            grid-template-columns: repeat(2, auto);
        }
    }
`;

const SubHeader = styled.div`
    width: 100%;
    border-top: ${themeVars.activeColor} 1px solid;
    border-bottom: ${themeVars.activeColor} 1px solid;
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
        background-color: ${themeVars.borderLightColor};
        color: ${themeVars.defaultTextColor};
    }
`;

const _sortViewFunction = (referenceOrder: string[]) => (viewA: IView, viewB: IView) => {
    const orderA = referenceOrder.indexOf(viewA.id);
    const orderB = referenceOrder.indexOf(viewB.id);
    const isAOrdered = orderA !== -1;
    const isBOrdered = orderB !== -1;

    if (isAOrdered && isBOrdered) {
        return orderA - orderB;
    } else if (isAOrdered && !isBOrdered) {
        return -1;
    } else if (!isAOrdered && isBOrdered) {
        return 1;
    } else {
        return Number(viewA.id) - Number(viewB.id);
    }
};

function ViewPanel(): JSX.Element {
    const {t} = useSharedTranslation();

    const {userData} = useUser();
    const {lang} = useLang();
    const [search, setSearch] = useState('');
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [editView, setEditView] = useState<IView | false>(false);

    const {updateViewsOrder} = useUpdateViewsOrderMutation(searchState.library.id);

    const getViewsList = useGetViewsListQuery({
        variables: {
            libraryId: searchState?.library?.id || ''
        }
    });

    const getOrderDataQuery = useGetUserDataQuery({
        variables: {
            keys: [
                PREFIX_USER_VIEWS_ORDER_KEY + searchState.library.id,
                PREFIX_SHARED_VIEWS_ORDER_KEY + searchState.library.id
            ]
        },
        onCompleted: d => {
            searchDispatch({
                type: SearchActionTypes.SET_USER_VIEWS_ORDER,
                userViewsOrder: d.userData?.data[PREFIX_USER_VIEWS_ORDER_KEY + searchState.library.id] || []
            });
            searchDispatch({
                type: SearchActionTypes.SET_SHARED_VIEWS_ORDER,
                sharedViewsOrder: d.userData?.data[PREFIX_SHARED_VIEWS_ORDER_KEY + searchState.library.id] || []
            });
        }
    });

    if (getViewsList.loading) {
        return <Loading />;
    }

    const _handleSearchSubmit = (value: string) => {
        setSearch(value);
    };

    const {sharedViews, userViews}: {sharedViews: IView[]; userViews: IView[]} = getViewsList.data?.views.list.reduce(
        (acc, view) => {
            const v: IView = prepareView(view, searchState.attributes, searchState.library.id, userData?.userId);

            if (search && !localizedTranslation(v.label, lang).toUpperCase().includes(search.toUpperCase())) {
                return acc;
            }

            if (v.shared) {
                return {...acc, sharedViews: [...acc.sharedViews, v]};
            }

            return {...acc, userViews: [...acc.userViews, v]};
        },
        {sharedViews: [], userViews: []}
    ) ?? {sharedViews: [], userViews: []};

    if (getViewsList.error || getOrderDataQuery.error) {
        return <ErrorDisplay message={(getViewsList.error || getOrderDataQuery.error).message} />;
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

        const isOrderingUserViews = result.source.droppableId === 'user';

        const viewsListBefore = isOrderingUserViews ? userViews : sharedViews;
        const orderedViews = viewsListBefore.map(v => v.id);

        const element = orderedViews[result.source.index];
        orderedViews.splice(result.source.index, 1);
        orderedViews.splice(result.destination.index, 0, element);

        const keyToUpdate = isOrderingUserViews
            ? PREFIX_USER_VIEWS_ORDER_KEY + searchState.library.id
            : PREFIX_SHARED_VIEWS_ORDER_KEY + searchState.library.id;

        await updateViewsOrder({
            key: keyToUpdate,
            value: orderedViews,
            global: false
        });
    };

    userViews.sort(_sortViewFunction(searchState.userViewsOrder));
    sharedViews.sort(_sortViewFunction(searchState.sharedViewsOrder));

    const handleHide = () => {
        searchDispatch({type: SearchActionTypes.TOGGLE_SIDEBAR});
    };

    return (
        <Wrapper>
            {editView && (
                <EditView
                    view={editView}
                    visible={!!editView}
                    onClose={_closeModal}
                    libraryId={searchState.library.id}
                />
            )}
            <Header>
                <span>{t('view.views')}</span>
                <Button onClick={handleHide} icon={<FontAwesomeIcon icon={faAngleLeft} />}></Button>
            </Header>
            <SearchWrapper>
                <Input.Search placeholder={t('view.search')} onSearch={_handleSearchSubmit} />
            </SearchWrapper>

            <SubHeader>{t('view.shared-views')}</SubHeader>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="shared">
                    {providedDroppable => (
                        <Views {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                            {sharedViews.map((view, idx) => (
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
                <Droppable droppableId="user">
                    {providedDroppable => (
                        <Views {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                            {userViews.map((view, idx) => (
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
