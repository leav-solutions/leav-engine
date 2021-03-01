// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EllipsisOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {Button, Dropdown, Menu} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IconChecked} from '../../../assets/icons/IconChecked';
import {viewSettingsField} from '../../../constants/constants';
import {useStateItem} from '../../../Context/StateItemsContext';
import {useLang} from '../../../hooks/LangHook/LangHook';
import deleteViewMutation, {
    IDeleteViewMutation,
    IDeleteViewMutationVariables
} from '../../../queries/views/deleteViewMutation';
import {IGetViewListElement} from '../../../queries/views/getViewsListQuery';
import themingVar from '../../../themingVar';
import {limitTextSize, localizedLabel} from '../../../utils';
import {IQueryFilter, IView} from '../../../_types/types';
import IconViewType from '../../IconViewType';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';

interface IWrapperProps {
    selected: boolean;
}

const Wrapper = styled.div<IWrapperProps>`
    position: relative;
    width: 100%;
    padding: 1rem;
    background: ${({selected}) => (selected ? `${themingVar['@leav-background-active']} ` : 'none')};

    &::before {
        content: '';
        position: absolute;
        padding: 5px;
        border-radius: 50%;
        left: 18px;
        top: 28px;
        background: ${({color}) => color ?? themingVar['@primary-color']};
    }

    & > div {
        margin-left: 36px;
    }
`;

interface ITypeProps {
    selected: boolean;
}

const Type = styled.div<ITypeProps>`
    border-radius: 8px;
    padding: 0.3rem 1rem;
    width: fit-content;
    display: grid;
    place-items: center;
    background-color: ${({selected}) =>
        selected ? `${themingVar['@leav-view-panel-label-background-active']} ` : themingVar['@leav-secondary-bg']};
    margin-top: 0.5rem;
`;

const Title = styled.div`
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Description = styled.div`
    opacity: 0.8;
    font-weight: 600;
    max-width: 100%;
    overflow: hidden;
`;

const CustomButton = styled(Button)`
    background-color: ${themingVar['@default-bg']};
    transform: scale(0.7);
    &:hover {
        background-color: ${themingVar['@default-bg']};
    }
`;

interface IViewProps {
    view: IGetViewListElement;
    onRename: (viewId: string) => void;
}

function View({view, onRename}: IViewProps): JSX.Element {
    const {t} = useTranslation();
    const {stateItems, dispatchItems} = useStateItem();
    const [{lang}] = useLang();

    const viewLabel = localizedLabel(view.label, lang);
    const viewDescription = localizedLabel(view.description, lang);

    const [deleteView] = useMutation<IDeleteViewMutation, IDeleteViewMutationVariables>(deleteViewMutation);

    const _changeView = () => {
        const filters = (view.filters ?? []).map(filter => {
            const queryFilter: IQueryFilter = {
                field: filter.field ?? undefined,
                value: filter.value ?? undefined,
                condition: filter.condition ?? undefined,
                operator: filter.operator ?? undefined
            };
            return queryFilter;
        });

        const currentView: IView = {
            id: view.id,
            label: viewLabel,
            type: view.type,
            color: view.color,
            shared: view.shared,
            description: viewDescription,
            fields: view.settings?.find(setting => setting.name === viewSettingsField)?.value ?? [],
            filters,
            sort: view.sort
        };

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_VIEW,
            view: {current: currentView}
        });

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_RELOAD_VIEW,
            reload: true
        });
    };

    const _handleDelete = () => {
        deleteView({variables: {viewId: view.id}});

        // set flag to refetch views
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_RELOAD_VIEW,
            reload: true
        });
    };

    const _handleRename = () => {
        onRename(view.id);
    };

    const selected = view.id === stateItems.view.current?.id;

    return (
        <>
            <Wrapper key={view.id} selected={selected} onClick={_changeView} color={view.color}>
                <div>
                    <Title>
                        <span>
                            {limitTextSize(localizedLabel(view.label, lang), 'medium')}
                            {selected && (
                                <span style={{marginLeft: '8px'}}>
                                    <IconChecked />
                                </span>
                            )}
                        </span>

                        <Dropdown
                            overlay={
                                <Menu>
                                    <Menu.Item onClick={_handleDelete}>{t('view.delete')}</Menu.Item>
                                    <Menu.Item onClick={_handleRename}>{t('view.rename')}</Menu.Item>
                                </Menu>
                            }
                        >
                            <CustomButton onClick={e => e.stopPropagation()} icon={<EllipsisOutlined />} />
                        </Dropdown>
                    </Title>
                    <Description>{viewDescription}</Description>
                    <Type selected={selected}>
                        <IconViewType type={view.type} showDescription={true} />
                    </Type>
                </div>
            </Wrapper>
        </>
    );
}

export default View;
