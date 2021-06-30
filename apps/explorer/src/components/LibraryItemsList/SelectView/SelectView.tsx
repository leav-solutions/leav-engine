// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MenuOutlined, PlusOutlined, SaveFilled} from '@ant-design/icons';
import {useMutation, useQuery} from '@apollo/client';
import {Dropdown, Menu, Spin} from 'antd';
import {IActiveLibrary} from 'graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import useStateFilters from 'hooks/FiltersStateHook/FiltersStateHook';
import useSearchReducer from 'hooks/useSearchReducer';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setDisplaySide} from 'redux/display';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {setViewCurrent} from 'redux/view';
import styled, {CSSObject} from 'styled-components';
import {ViewTypes} from '_gqlTypes/globalTypes';
import {defaultView, viewSettingsField} from '../../../constants/constants';
import addViewMutation, {
    IAddViewMutation,
    IAddViewMutationVariables,
    IAddViewMutationVariablesView
} from '../../../graphQL/mutations/views/addViewMutation';
import {
    getViewsListQuery,
    IGetViewListQuery,
    IGetViewListVariables
} from '../../../graphQL/queries/views/getViewsListQuery';
import {useLang} from '../../../hooks/LangHook/LangHook';
import themingVar from '../../../themingVar';
import {limitTextSize, localizedLabel} from '../../../utils';
import {IView, TypeSideItem, IQueryFilter} from '../../../_types/types';
import AddView from '../AddView';

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

interface IModalProps {
    visible: boolean;
    id?: string;
}

interface ISelectViewProps {
    activeLibrary: IActiveLibrary;
}

function SelectView({activeLibrary}: ISelectViewProps): JSX.Element {
    const {t} = useTranslation();

    const {state: searchState} = useSearchReducer();
    const {view, display, filters} = useAppSelector(state => state);
    const dispatch = useAppDispatch();
    const {stateFilters} = useStateFilters();

    const [modalNewProps, setModalNewProps] = useState<Omit<IModalProps, 'id'>>({
        visible: false
    });

    const [{lang}] = useLang();

    const {data, loading, error} = useQuery<IGetViewListQuery, IGetViewListVariables>(getViewsListQuery, {
        variables: {
            libraryId: activeLibrary?.id || ''
        }
    });

    const currentView = data?.views.list.find(dataView => dataView.id === view.current?.id);

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
        if (view.current && view.current.id !== defaultView.id) {
            if (currentView && activeLibrary) {
                // Fields
                let viewFields: string[] = [];
                if (currentView.type === ViewTypes.list) {
                    viewFields = searchState.fields.map(field => {
                        const settingsField = field.key;
                        return settingsField;
                    });
                }

                const viewFilters = stateFilters.queryFilters.reduce((acc, queryFilter) => {
                    return [...acc, queryFilter];
                }, [] as IQueryFilter[]);

                const viewSort = {
                    field: searchState.sort.field,
                    order: searchState.sort.order
                };

                const newView: IAddViewMutationVariablesView = {
                    id: currentView.id,
                    library: activeLibrary.id,
                    shared: currentView.shared,
                    type: currentView.type,
                    label: currentView.label,
                    description: currentView.description,
                    color: currentView.color ?? themingVar['@primary-color'],
                    filters: viewFilters,
                    sort: viewSort,
                    settings: [
                        {
                            name: viewSettingsField,
                            value: viewFields
                        }
                    ]
                };

                try {
                    // save view in backend
                    await addView({variables: {view: newView}});
                } catch (e) {
                    console.error(e);
                }

                // update current view
                const newCurrentView: IView = {
                    id: currentView.id,
                    label: localizedLabel(newView.label, lang),
                    description: localizedLabel(newView.description, lang),
                    type: newView.type,
                    color: newView.color,
                    shared: newView.shared,
                    fields: newView.settings?.find(setting => setting.name === viewSettingsField)?.value ?? [],
                    filters: filters.queryFilters,
                    sort: viewSort
                };

                dispatch(setViewCurrent(newCurrentView));
            }
        }
    };

    const _handleAddView = () => {
        setModalNewProps({
            visible: true
        });
    };

    const _closeModal = () => {
        setModalNewProps(props => ({
            ...props,
            visible: false
        }));
    };

    if (error) {
        return <>error</>;
    }

    if (loading) {
        return (
            <div>
                <Spin />
            </div>
        );
    }

    const menu = (
        <Menu>
            <Menu.Item icon={<SaveFilled />} onClick={_saveView} disabled={view.current?.id === defaultView.id}>
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
            <AddView visible={modalNewProps.visible} onClose={_closeModal} activeLibrary={activeLibrary} />
            <DropdownButton overlay={menu} data-testid="dropdown-view-options">
                <InnerDropdown onClick={_toggleShowView} color={view.current?.color}>
                    {limitTextSize(view.current?.label ?? t('select-view.default-view'), 'medium')}
                </InnerDropdown>
            </DropdownButton>
        </>
    );
}

export default SelectView;
