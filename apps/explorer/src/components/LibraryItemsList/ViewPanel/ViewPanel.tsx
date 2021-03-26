// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {Badge, Input, Spin} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useStateItem} from '../../../Context/StateItemsContext';
import {
    getViewsListQuery,
    IGetViewListElement,
    IGetViewListQuery,
    IGetViewListVariables
} from '../../../graphQL/queries/views/getViewsListQuery';
import {useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from '../../../hooks/LangHook/LangHook';
import themingVar from '../../../themingVar';
import {localizedLabel} from '../../../utils';
import EditView from '../EditView';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';
import View from '../View/View';

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

    const [search, setSearch] = useState('');

    const {stateItems, dispatchItems} = useStateItem();
    const [activeLibrary] = useActiveLibrary();
    const [{lang}] = useLang();

    const [editView, setEditView] = useState<string | false>(false);

    const {data, loading, error, refetch} = useQuery<IGetViewListQuery, IGetViewListVariables>(getViewsListQuery, {
        variables: {
            libraryId: activeLibrary?.id || ''
        }
    });

    useEffect(() => {
        if (stateItems.view.reload) {
            refetch();
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_RELOAD_VIEW,
                reload: false
            });
        }
    }, [stateItems.view.reload, refetch, dispatchItems]);

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

    const {sharedViews, userViews} = data?.views.list.reduce(
        (acc, view) => {
            if (search) {
                const valueName = localizedLabel(view.label, lang);
                if (!valueName.toUpperCase().includes(search.toUpperCase())) {
                    return acc;
                }
            }
            if (view.shared) {
                return {...acc, sharedViews: [...acc.sharedViews, view]};
            } else {
                return {...acc, userViews: [...acc.userViews, view]};
            }
        },
        {sharedViews: [] as IGetViewListElement[], userViews: [] as IGetViewListElement[]}
    ) ?? {
        sharedViews: [] as IGetViewListElement[],
        userViews: [] as IGetViewListElement[]
    };

    if (error || (!sharedViews && !userViews)) {
        return <div>error</div>;
    }

    const _showModal = (viewId: string) => {
        setEditView(viewId);
    };

    const _closeModal = () => {
        setEditView(false);
    };

    return (
        <Wrapper>
            {editView && <EditView id={editView} visible={!!editView} onClose={_closeModal} />}
            <Header>{t('view.list')}</Header>

            <SearchWrapper>
                <Input.Search onSearch={_handleSearchSubmit} />
            </SearchWrapper>

            <SubHeader>
                {t('view.shared-views')}
                <CustomBadge count={sharedViews.length} />
            </SubHeader>

            <Views>
                {sharedViews.map(view => (
                    <View key={view.id} view={view} onRename={_showModal} />
                ))}
            </Views>
            <SubHeader>
                {t('view.my-views')}
                <CustomBadge count={userViews.length} />
            </SubHeader>
            <Views>
                {userViews.map(view => (
                    <View key={view.id} view={view} onRename={_showModal} />
                ))}
            </Views>
        </Wrapper>
    );
}

export default ViewPanel;
