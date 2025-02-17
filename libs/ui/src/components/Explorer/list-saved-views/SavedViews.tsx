// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import styled from 'styled-components';
import {KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../manage-view-settings/store-view-settings/useViewSettingsContext';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {FaCheck} from 'react-icons/fa';
import {ViewActions} from '../manage-view-settings/save-view/ViewActions';

const StyledListUlContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const ContentWrapperStyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
`;

const StyledListUl = styled.ul`
    padding: calc(var(--general-spacing-s) * 1px) 0;
    margin: 0 0 calc(var(--general-spacing-xs) * 1px) 0;
    list-style: none;
    color: var(--general-utilities-text-primary);
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-xs) * 1px);
`;

const StyleViewItemLi = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: calc(var(--general-spacing-xxs) * 1px) calc(var(--general-spacing-xs) * 1px);
    border: 1px solid transparent;
    border-radius: calc(var(--general-border-radius-s) * 1px);
    height: calc(var(--general-spacing-l) * 1px);
    cursor: pointer;

    &:hover {
        border-color: var(--general-utilities-main-default);
        background-color: var(--general-utilities-light);
    }

    .check {
        color: var(--general-utilities-main-default);
        margin-left: calc(var(--general-spacing-xs) * 1px);
        font-size: calc(var(--general-typography-fontSize5) * 1px);
        flex: 0 0 auto;
        display: none;
    }

    &.selected {
        background: var(--general-utilities-main-light);

        .check {
            display: inline-block;
        }
    }
`;

export const SavedViews: FunctionComponent = () => {
    const {t} = useSharedTranslation();
    const {view} = useViewSettingsContext();
    const {availableLangs} = useLang();

    const sharedViews = view.savedViews.filter(viewItem => viewItem.shared);
    const myViews = view.savedViews.filter(viewItem => !viewItem.shared);

    const _getViewClassName = (viewId?: string) => (view.viewId === viewId ? 'selected' : '');

    return (
        <ContentWrapperStyledDiv>
            <StyledListUlContainer>
                <KitTypography.Title level="h4">{t('explorer.my-views')}</KitTypography.Title>
                <StyledListUl aria-label={t('explorer.my-views')}>
                    <StyleViewItemLi className={_getViewClassName()}>
                        <KitTypography.Text size="fontSize5" weight="medium" ellipsis>
                            {t('explorer.default-view')}
                        </KitTypography.Text>
                        <FaCheck className="check" />
                    </StyleViewItemLi>
                    {myViews.map(viewItem => (
                        <StyleViewItemLi key={viewItem.id} className={_getViewClassName(viewItem.id)}>
                            <KitTypography.Text size="fontSize5" weight="medium" ellipsis>
                                {localizedTranslation(viewItem.label, availableLangs)}
                            </KitTypography.Text>
                            <FaCheck className="check" />
                        </StyleViewItemLi>
                    ))}
                </StyledListUl>
                <KitTypography.Title level="h4">{t('explorer.shared-views')}</KitTypography.Title>
                {sharedViews.length === 0 ? (
                    <KitTypography.Text size="fontSize5">{t('explorer.no-shared-views')}</KitTypography.Text>
                ) : (
                    <StyledListUl aria-label={t('explorer.shared-view')}>
                        {sharedViews.map(viewItem => (
                            <StyleViewItemLi key={viewItem.id} className={_getViewClassName(viewItem.id)}>
                                <KitTypography.Text size="fontSize5" weight="medium" ellipsis>
                                    {localizedTranslation(viewItem.label, availableLangs)}
                                </KitTypography.Text>
                                <FaCheck className="check" />
                            </StyleViewItemLi>
                        ))}
                    </StyledListUl>
                )}
            </StyledListUlContainer>
            <ViewActions />
        </ContentWrapperStyledDiv>
    );
};
