// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CopyOutlined, DeleteOutlined, EditOutlined} from '@ant-design/icons';
import {themeVars, useLang} from '@leav/ui';
import {objectToNameValueArray} from '@leav/utils';
import {Button, Tooltip, Typography} from 'antd';
import useAddViewMutation from 'graphQL/mutations/views/hooks/useAddViewMutation';
import useDeleteViewMutation from 'graphQL/mutations/views/hooks/useDeleteViewMutation';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import _ from 'lodash';
import {useState} from 'react';
import {DraggableProvidedDragHandleProps} from 'react-beautiful-dnd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {defaultView} from '../../../../constants/constants';
import {localizedTranslation} from '../../../../utils';
import {getRequestFromFilters} from '../../../../utils/getRequestFromFilter';
import {IView} from '../../../../_types/types';
import IconViewType from '../../../IconViewType';

interface IWrapperProps {
    selected: boolean;
}

const Infos = styled.div`
    width: 100%;
`;

const Wrapper = styled.div<IWrapperProps>`
    background: ${({selected}) => (selected ? `${themeVars.activeColor} ` : 'none')};
    padding: 0.5rem;
    display: flex;
    align-items: center;
`;

const Handle = styled.div`
    content: '....';
    width: 20px;
    height: 30px;
    display: inline-block;
    line-height: 5px;
    padding: 3px 4px;
    vertical-align: middle;
    font-size: 12px;
    font-family: sans-serif;
    letter-spacing: 2px;
    color: ${themeVars.borderLightColor};
    text-shadow: 1px 0 1px black;

    &::after {
        content: '.. .. .. ..';
    }
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    margin-left: 10px;
`;

const Description = styled.div`
    opacity: 0.8;
    margin-left: 10px;
    overflow: hidden;
`;

interface IViewProps {
    view: IView;
    onEdit: (viewId: string) => void;
    handleProps?: DraggableProvidedDragHandleProps;
}

function View({view, onEdit, handleProps}: IViewProps): JSX.Element {
    const {t} = useTranslation();
    const {lang, defaultLang} = useLang();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [description, setDescription] = useState<{expand: boolean; key: number}>({expand: false, key: 0});

    const {addView} = useAddViewMutation(searchState.library.id);

    const {deleteView} = useDeleteViewMutation();

    const _changeView = () => {
        searchDispatch({type: SearchActionTypes.CHANGE_VIEW, view});
    };

    const ROWS_DESCRIPTION = 3;

    const _handleDelete = async (event: any) => {
        // stop progation to avoid click on view
        event.stopPropagation();

        await deleteView(view.id);

        // set flag to refetch views
        if (view.id === searchState.view.current.id) {
            searchDispatch({type: SearchActionTypes.CHANGE_VIEW, view: defaultView});
        }

        searchDispatch(
            !view.shared
                ? {
                      type: SearchActionTypes.SET_USER_VIEWS_ORDER,
                      userViewsOrder: searchState.userViewsOrder.filter(id => id !== view.id)
                  }
                : {
                      type: SearchActionTypes.SET_SHARED_VIEWS_ORDER,
                      sharedViewsOrder: searchState.sharedViewsOrder.filter(id => id !== view.id)
                  }
        );
    };

    const _handleDuplicate = async (event: any) => {
        // stop progation to avoid click on view
        event.stopPropagation();

        try {
            const newViewRes = await addView({
                view: {
                    ..._.omit(view, 'owner'),
                    label: {
                        [defaultLang]: `${localizedTranslation(view.label, lang)} (${t('global.copy')})`
                    },
                    filters: getRequestFromFilters(view.filters),
                    id: undefined,
                    library: searchState.library.id,
                    valuesVersions: objectToNameValueArray(searchState.valuesVersions).map(version => ({
                        treeId: version.name,
                        treeNode: version.value.id
                    })),
                    shared: false
                }
            });

            // set flag to refetch views
            searchDispatch({
                type: SearchActionTypes.SET_VIEW_RELOAD,
                reload: true
            });

            searchDispatch({
                type: SearchActionTypes.SET_USER_VIEWS_ORDER,
                userViewsOrder: [...searchState.userViewsOrder, newViewRes.data.saveView.id]
            });
        } catch (e) {
            console.error(e);
        }
    };

    const _handleEdit = (event: any) => {
        // stop progation to avoid click on view
        event.stopPropagation();

        onEdit(view.id);
    };

    const _onExpand = () => {
        setDescription({expand: true, key: description.key});
    };

    const _onClose = () => {
        setDescription({expand: false, key: description.key + 1});
    };

    const selected = view.id === searchState.view.current?.id;

    const [isActionsShown, setIsActionsShown] = useState(false);

    const viewLabel = localizedTranslation(view.label, lang);
    return (
        <Wrapper
            key={view.id}
            selected={selected}
            onClick={_changeView}
            color={view.color}
            onMouseEnter={() => setIsActionsShown(true)}
            onMouseLeave={() => setIsActionsShown(false)}
        >
            <Handle className="view-handle" {...handleProps} />
            <Infos>
                <Title data-testid="view-title">
                    <IconViewType type={view.display.type} />
                    <Typography.Text ellipsis={{tooltip: true}} style={{padding: '0 .5em', width: 'calc(100% - 1em)'}}>
                        {viewLabel}
                    </Typography.Text>
                </Title>
                {view.description && (
                    <Description>
                        <Typography.Paragraph
                            key={description.key}
                            ellipsis={{
                                rows: ROWS_DESCRIPTION,
                                expandable: true,
                                onExpand: _onExpand,
                                symbol: t('view.see-more')
                            }}
                            style={{marginBottom: 0}}
                        >
                            {localizedTranslation(view.description, lang)}
                        </Typography.Paragraph>
                        {description.expand && (
                            <a
                                href="!#"
                                onClick={ev => {
                                    ev.preventDefault();
                                    _onClose();
                                }}
                            >
                                {t('global.close')}
                            </a>
                        )}
                    </Description>
                )}
            </Infos>

            {isActionsShown && (
                <>
                    <Tooltip title={t('global.edit')}>
                        <Button
                            key="edit"
                            onClick={_handleEdit}
                            disabled={!view.owner}
                            type="text"
                            size="small"
                            shape="circle"
                            icon={<EditOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title={t('global.duplicate')}>
                        <Button
                            key="duplicate"
                            onClick={_handleDuplicate}
                            type="text"
                            size="small"
                            shape="circle"
                            icon={<CopyOutlined />}
                        />
                    </Tooltip>
                    <Tooltip title={t('global.delete')}>
                        <Button
                            key="delete"
                            onClick={_handleDelete}
                            disabled={!view.owner}
                            type="text"
                            size="small"
                            shape="circle"
                            icon={<DeleteOutlined />}
                        />
                    </Tooltip>
                </>
            )}
        </Wrapper>
    );
}

export default View;
