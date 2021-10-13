// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MenuOutlined, PlusOutlined, SaveFilled, AppstoreFilled, ClearOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Button, Dropdown, Menu} from 'antd';
import {IActiveLibrary} from 'graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {setDisplaySide} from 'redux/display';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {defaultView, viewSettingsField} from '../../../constants/constants';
import addViewMutation, {
    IAddViewMutation,
    IAddViewMutationVariables,
    IAddViewMutationVariablesView
} from '../../../graphQL/mutations/views/addViewMutation';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {limitTextSize, localizedTranslation} from '../../../utils';
import {TypeSideItem} from '../../../_types/types';
import {getRequestFromFilters} from '../FiltersPanel/getRequestFromFilter';
import {ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import _ from 'lodash';
import FiltersDropdown from './FiltersDropdown';

interface IMenuViewProps {
    activeLibrary: IActiveLibrary;
}

function MenuView({activeLibrary}: IMenuViewProps): JSX.Element {
    const {t} = useTranslation();

    const [{lang, defaultLang}] = useLang();
    const dispatch = useAppDispatch();
    const {display} = useAppSelector(state => state);
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const [addView] = useMutation<IAddViewMutation, IAddViewMutationVariables>(addViewMutation);

    const _toggleShowView = () => {
        const visible = !display.side.visible || display.side.type !== TypeSideItem.view;

        dispatch(
            setDisplaySide({
                visible,
                type: TypeSideItem.view
            })
        );
    };

    const _saveView = async () => {
        if (searchState.view.current.id !== defaultView.id) {
            try {
                // Fields
                let viewFields: string[] = [];

                if (searchState.view.current.display.type === ViewTypes.list) {
                    viewFields = searchState.fields.map(f => f.key);
                }

                // save view in backend
                await addView({
                    variables: {
                        view: {
                            ..._.omit(searchState.view.current, 'owner'),
                            library: activeLibrary.id,
                            sort: searchState.sort.active
                                ? {field: searchState.sort.field, order: searchState.sort.order}
                                : undefined,
                            display: searchState.display,
                            filters: getRequestFromFilters(searchState.filters),
                            settings: [
                                {
                                    name: viewSettingsField,
                                    value: viewFields
                                }
                            ]
                        }
                    }
                });

                searchDispatch({
                    type: SearchActionTypes.SET_VIEW,
                    view: {
                        current: {
                            ...searchState.view.current,
                            sort: searchState.sort.active
                                ? {field: searchState.sort.field, order: searchState.sort.order}
                                : undefined,
                            display: searchState.display,
                            filters: searchState.filters,
                            settings: [
                                {
                                    name: viewSettingsField,
                                    value: viewFields
                                }
                            ]
                        },
                        reload: true,
                        sync: false
                    }
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const _setView = () => {
        searchDispatch({
            type: SearchActionTypes.SET_VIEW,
            view: {current: searchState.view.current, reload: true, sync: false}
        });
    };

    const _handleAddView = async (viewType: ViewTypes) => {
        const newView: IAddViewMutationVariablesView = {
            ..._.omit(defaultView, ['id', 'owner']),
            label: {[defaultLang]: t('view.add-view.title')},
            library: activeLibrary.id,
            display: {type: viewType, size: ViewSizes.MEDIUM},
            filters: []
        };

        // save view in backend
        const newViewRes = await addView({
            variables: {
                view: newView
            }
        });

        searchDispatch({
            type: SearchActionTypes.SET_VIEW,
            view: {
                current: {
                    ...newView,
                    owner: true,
                    id: newViewRes.data.saveView.id,
                    filters: []
                },
                reload: true,
                sync: false
            }
        });

        searchDispatch({
            type: SearchActionTypes.SET_USER_VIEWS_ORDER,
            userViewsOrder: [...searchState.userViewsOrder, newViewRes.data.saveView.id]
        });
    };

    const menu = (
        <Menu>
            <Menu.Item onClick={() => _handleAddView(ViewTypes.list)}>
                <span>
                    <PlusOutlined />
                    <MenuOutlined />
                </span>{' '}
                {t('view.type-list')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => _handleAddView(ViewTypes.cards)}>
                <span>
                    <PlusOutlined />
                    <AppstoreFilled />
                </span>{' '}
                {t('view.type-cards')}
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            <Button
                data-testid="dropdown-view-options"
                onClick={_toggleShowView}
                color={searchState.view.current?.color}
            >
                {limitTextSize(
                    localizedTranslation(searchState.view.current?.label, lang) ?? t('select-view.default-view'),
                    'medium'
                )}
            </Button>
            <Button icon={<ClearOutlined />} onClick={_setView} />
            <Button
                icon={<SaveFilled />}
                onClick={_saveView}
                disabled={
                    searchState.view.sync ||
                    searchState.view.current?.id === defaultView.id ||
                    !searchState.view.current.owner
                }
            />
            <Dropdown overlay={menu}>
                <Button>
                    <PlusOutlined />
                </Button>
            </Dropdown>
            <FiltersDropdown activeLibrary={activeLibrary} />
        </>
    );
}

export default MenuView;
