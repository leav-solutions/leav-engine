// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AppstoreFilled, FilterOutlined, MenuOutlined, PlusOutlined, SaveFilled} from '@ant-design/icons';
import {localizedTranslation, objectToNameValueArray} from '@leav/utils';
import {Badge, Button, Dropdown, MenuProps, Space, Tooltip} from 'antd';
import {GrUndo} from 'react-icons/gr';
import {VscLayers} from 'react-icons/vsc';
import styled from 'styled-components';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {SearchActionTypes} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation/useExecuteSaveViewMutation';
import useLang from '_ui/hooks/useLang';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SidebarContentType} from '_ui/types/search';
import {ViewInput, ViewTypes} from '_ui/_gqlTypes';
import {ILibraryDetailExtended} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';
import {prepareView} from '_ui/_utils';
import {getRequestFromFilters} from '_ui/_utils/getRequestFromFilter';
import {PREFIX_USER_VIEWS_ORDER_KEY} from '../../../constants';
import {useUser} from '../../../hooks/useUser/useUser';
import {defaultView} from '../constants';
import FiltersDropdown from '../FiltersDropdown';
import useUpdateViewsOrderMutation from '../hooks/useUpdateViewsOrderMutation';
import IconViewType from '../IconViewType';

interface IMenuViewProps {
    library: ILibraryDetailExtended;
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
    const {t} = useSharedTranslation();
    const {lang, defaultLang} = useLang();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const {userData} = useUser();

    const {saveView: addView} = useExecuteSaveViewMutation();
    const {updateViewsOrder} = useUpdateViewsOrderMutation(library.id);

    const _toggleShowView = () => {
        const visible = !searchState.sideBar.visible || searchState.sideBar.type !== SidebarContentType.view;
        searchDispatch({
            type: SearchActionTypes.SET_SIDEBAR,
            sidebarType: SidebarContentType.view,
            visible
        });
    };

    const _toggleShowFilters = () => {
        const visible = !searchState.sideBar.visible || searchState.sideBar.type !== SidebarContentType.filters;
        searchDispatch({
            type: SearchActionTypes.SET_SIDEBAR,
            sidebarType: SidebarContentType.filters,
            visible
        });
    };

    const _toggleShowVersions = () => {
        const visible = !searchState.sideBar.visible || searchState.sideBar.type !== SidebarContentType.filters;
        searchDispatch({
            type: SearchActionTypes.SET_SIDEBAR,
            sidebarType: SidebarContentType.versions,
            visible
        });
    };

    const _resetView = () => {
        searchDispatch({
            type: SearchActionTypes.CHANGE_VIEW,
            view: searchState.view.current
        });
    };

    const _getNewViewFromSearchState = (): ViewInput => ({
        library: library.id,
        label: {
            [defaultLang]: t('view.add-view.title', {lng: defaultLang})
        },
        display: searchState.display,
        shared: false,
        sort: searchState.sort,
        filters: getRequestFromFilters(searchState.filters),
        valuesVersions: searchState.valuesVersions
            ? objectToNameValueArray(searchState.valuesVersions)
                  .map(version => ({
                      treeId: version?.name ?? null,
                      treeNode: version?.value?.id ?? null
                  }))
                  .filter(v => v.treeId !== null && v.treeNode !== null)
            : null,
        attributes: searchState.fields?.map(f => f.key) ?? []
    });

    const _saveView = async () => {
        if (searchState.view.current.id !== defaultView.id) {
            // save view in backend
            await addView({
                view: {
                    ..._getNewViewFromSearchState(),
                    id: searchState.view.current.id,
                    label: searchState.view.current.label,
                    description: searchState.view.current.description,
                    shared: searchState.view.current.shared,
                    color: searchState.view.current.color,
                    sort: searchState.sort ?? null
                }
            });

            searchDispatch({
                type: SearchActionTypes.SET_VIEW_SYNC,
                sync: true
            });
        }
    };

    const _handleAddView = async (viewType: ViewTypes) => {
        const newView: ViewInput = {
            ..._getNewViewFromSearchState(),
            display: {...searchState.display, type: viewType}
        };

        // save view in backend
        const newViewRes = await addView({
            view: newView
        });

        await updateViewsOrder({
            key: PREFIX_USER_VIEWS_ORDER_KEY + newView.library,
            value: [...searchState.userViewsOrder, newViewRes.data.saveView.id],
            global: false
        });

        searchDispatch({
            type: SearchActionTypes.CHANGE_VIEW,
            view: prepareView(
                newViewRes.data.saveView,
                searchState.attributes,
                searchState.library.id,
                userData?.userId
            )
        });
    };

    const menu: MenuProps = {
        items: [
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
        ]
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
                <Dropdown menu={menu} trigger={['click']}>
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
                        button={<Button icon={<PlusOutlined />} type="default" />}
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
