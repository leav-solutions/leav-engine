// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MenuOutlined, PlusOutlined, SaveFilled} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Dropdown, Menu} from 'antd';
import {IActiveLibrary} from 'graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {setDisplaySide} from 'redux/display';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled, {CSSObject} from 'styled-components';
import {defaultView, viewSettingsField} from '../../../constants/constants';
import addViewMutation, {
    IAddViewMutation,
    IAddViewMutationVariables,
    IAddViewMutationVariablesView
} from '../../../graphQL/mutations/views/addViewMutation';
import {useLang} from '../../../hooks/LangHook/LangHook';
import themingVar from '../../../themingVar';
import {limitTextSize, localizedTranslation} from '../../../utils';
import {TypeSideItem} from '../../../_types/types';
import {getRequestFromFilters} from '../FiltersPanel/getRequestFromFilter';
import _ from 'lodash';
import {ViewTypes} from '_gqlTypes/globalTypes';

const DropdownButton = styled(Dropdown.Button)`
    .ant-dropdown-trigger {
        background-color: ${themingVar['@leav-secondary-action-bg']};
    }
`;

interface IInnerDropdownProps {
    color?: string;
    style?: CSSObject;
}

const InnerDropdown = styled.span<IInnerDropdownProps>`
    transform: translate(5px);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        left: -11px;
        top: 8px;
        border-radius: 50%;
        padding: 3px;
        background: ${({color}) => color ?? themingVar['@primary-color']};
    }
`;

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

                if (searchState.view.current.type === ViewTypes.list) {
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
                            type: searchState.displayType,
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
                            type: searchState.displayType,
                            filters: searchState.filters,
                            settings: [
                                {
                                    name: viewSettingsField,
                                    value: viewFields
                                }
                            ]
                        },
                        reload: true
                    }
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const _handleAddView = async () => {
        const newView: IAddViewMutationVariablesView = {
            ..._.omit(defaultView, ['id', 'owner']),
            label: {[defaultLang]: t('view.add-view.title')},
            library: activeLibrary.id,
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
                reload: true
            }
        });

        searchDispatch({
            type: SearchActionTypes.SET_USER_VIEWS_ORDER,
            userViewsOrder: [...searchState.userViewsOrder, newViewRes.data.saveView.id]
        });
    };

    const menu = (
        <Menu>
            <Menu.Item
                icon={<SaveFilled />}
                onClick={_saveView}
                disabled={searchState.view.current?.id === defaultView.id || !searchState.view.current.owner}
            >
                {t('select-view.save')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={_handleAddView}>
                <span>
                    <PlusOutlined />
                    <MenuOutlined />
                </span>{' '}
                {t('select-view.add-view')}
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            <DropdownButton overlay={menu} data-testid="dropdown-view-options">
                <InnerDropdown onClick={_toggleShowView} color={searchState.view.current?.color}>
                    {limitTextSize(
                        localizedTranslation(searchState.view.current?.label, lang) ?? t('select-view.default-view'),
                        'medium'
                    )}
                </InnerDropdown>
            </DropdownButton>
        </>
    );
}

export default MenuView;
