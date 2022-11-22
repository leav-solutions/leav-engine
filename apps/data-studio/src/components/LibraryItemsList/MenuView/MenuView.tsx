// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AppstoreFilled, FilterOutlined, MenuOutlined, PlusOutlined, SaveFilled} from '@ant-design/icons';
import {objectToNameValueArray} from '@leav/utils';
import {Badge, Button, Dropdown, Menu, Space, Tooltip} from 'antd';
import useAddViewMutation from 'graphQL/mutations/views/hooks/useAddViewMutation';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import _ from 'lodash';
import {useTranslation} from 'react-i18next';
import {GrUndo} from 'react-icons/gr';
import {VscLayers} from 'react-icons/vsc';
import {setDisplaySide} from 'redux/display';
import {addInfo} from 'redux/infos';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {GET_LIBRARY_DETAIL_EXTENDED_libraries_list} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import {defaultView, viewSettingsField} from '../../../constants/constants';
import {IAddViewMutationVariablesView} from '../../../graphQL/mutations/views/saveViewMutation';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {localizedTranslation} from '../../../utils';
import {InfoChannel, InfoType, TypeSideItem} from '../../../_types/types';
import IconViewType from '../../IconViewType/IconViewType';
import FiltersDropdown from '../FiltersDropdown';
import {getRequestFromFilters} from '../FiltersPanel/getRequestFromFilter';

interface IMenuViewProps {
    library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list;
}

const ViewButton = styled(Button)`
    && {
        display: flex;
        align-items: center;
    }
`;

const ViewLabel = styled.span`
    width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    whitespace: nowrap;
`;

function MenuView({library}: IMenuViewProps): JSX.Element {
    const {t} = useTranslation();

    const [{lang, defaultLang}] = useLang();
    const dispatch = useAppDispatch();
    const {display} = useAppSelector(state => state);
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const {addView} = useAddViewMutation(library.id);

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
                    view: {
                        ..._.omit(searchState.view.current, 'owner'),
                        library: library.id,
                        sort: searchState.sort.active
                            ? {field: searchState.sort.field, order: searchState.sort.order}
                            : undefined,
                        display: searchState.display,
                        filters: getRequestFromFilters(searchState.filters),
                        valuesVersions: searchState.valuesVersions
                            ? objectToNameValueArray(searchState.valuesVersions)
                                  .map(version => ({
                                      treeId: version?.name ?? null,
                                      treeNode: version?.value?.id ?? null
                                  }))
                                  .filter(v => v.treeId !== null && v.treeNode !== null)
                            : null,
                        settings: [
                            {
                                name: viewSettingsField,
                                value: viewFields
                            }
                        ]
                    }
                });

                searchDispatch({
                    type: SearchActionTypes.SET_VIEW_SYNC,
                    sync: true
                });
            } catch (e) {
                dispatch(
                    addInfo({
                        type: InfoType.error,
                        content: `${t('error.error_occurred')}: ${e.message}`,
                        channel: InfoChannel.trigger
                    })
                );
                console.error(e);
            }
        }
    };

    const _resetView = () => {
        searchDispatch({
            type: SearchActionTypes.CHANGE_VIEW,
            view: searchState.view.current
        });
    };

    const _handleAddView = async (viewType: ViewTypes) => {
        const newView: IAddViewMutationVariablesView = {
            ..._.omit(defaultView, ['id', 'owner']),
            label: {[defaultLang]: t('view.add-view.title')},
            library: library.id,
            display: {type: viewType, size: ViewSizes.MEDIUM},
            filters: []
        };

        // save view in backend
        const newViewRes = await addView({
            view: newView
        });

        searchDispatch({
            type: SearchActionTypes.CHANGE_VIEW,
            view: {
                ...newView,
                owner: true,
                id: newViewRes.data.saveView.id,
                filters: []
            }
        });

        searchDispatch({
            type: SearchActionTypes.SET_USER_VIEWS_ORDER,
            userViewsOrder: [...searchState.userViewsOrder, newViewRes.data.saveView.id]
        });
    };

    const menu = (
        <Menu
            items={[
                {
                    key: 'add-group',
                    type: 'group',
                    label: t('view.add-view.title'),
                    children: [
                        {
                            key: 'list',
                            onClick: () => _handleAddView(ViewTypes.list),
                            icon: <MenuOutlined />,
                            label: t('view.type-list')
                        },
                        {
                            key: 'cards',
                            onClick: () => _handleAddView(ViewTypes.cards),
                            icon: <AppstoreFilled />,
                            label: t('view.type-cards')
                        }
                    ]
                }
            ]}
        />
    );

    const _toggleShowFilters = () => {
        dispatch(
            setDisplaySide({
                visible: !display.side.visible || display.side.type !== TypeSideItem.filters,
                type: TypeSideItem.filters
            })
        );
    };

    const _toggleShowVersions = () => {
        dispatch(
            setDisplaySide({
                visible: !display.side.visible || display.side.type !== TypeSideItem.versions,
                type: TypeSideItem.versions
            })
        );
    };

    return (
        <Space size="large">
            <Button.Group>
                <Tooltip
                    title={localizedTranslation(searchState.view.current?.label, lang) || t('select-view.default-view')}
                >
                    <ViewButton
                        icon={
                            <IconViewType style={{marginRight: '8px'}} type={searchState.view.current.display.type} />
                        }
                        data-testid="dropdown-view-options"
                        onClick={_toggleShowView}
                        color={searchState.view.current?.color}
                    >
                        <ViewLabel>
                            {localizedTranslation(searchState.view.current?.label, lang) ||
                                t('select-view.default-view')}
                        </ViewLabel>
                    </ViewButton>
                </Tooltip>
                <Button
                    disabled={searchState.view.sync}
                    icon={<GrUndo />}
                    onClick={_resetView}
                    style={{paddingTop: '6px'}}
                />
                <Button
                    icon={<SaveFilled />}
                    onClick={_saveView}
                    disabled={
                        searchState.view.sync ||
                        searchState.view.current?.id === defaultView.id ||
                        !searchState.view.current.owner
                    }
                />
                <Dropdown overlay={menu} trigger={['click']}>
                    <Button icon={<PlusOutlined />}></Button>
                </Dropdown>
            </Button.Group>
            <Badge dot={!!searchState.filters.length}>
                <Button.Group>
                    <Button onClick={_toggleShowFilters} icon={<FilterOutlined />}>
                        {t('filters.filters')}
                    </Button>
                    <FiltersDropdown
                        libraryId={library.id}
                        button={<Button icon={<PlusOutlined />} type={'default'} />}
                        attributes={library.attributes}
                        trees={library.linkedTrees}
                        libraries={[]}
                    />
                </Button.Group>
            </Badge>
            <Button onClick={_toggleShowVersions} icon={<VscLayers />} style={{paddingTop: '5px'}} />
        </Space>
    );
}

export default MenuView;
