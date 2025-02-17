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
import {useOpenViewSettings} from '../manage-view-settings';

const StyledListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-m) * 1px);
`;

const StyledList = styled.ul`
    padding: calc(var(--general-spacing-s) * 1px) 0;
    margin: 0;
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

export const MyViewsList: FunctionComponent<{}> = ({}) => {
    const {t} = useSharedTranslation();
    const {view} = useViewSettingsContext();
    const {viewName} = useOpenViewSettings({view});
    const {defaultLang} = useLang();

    const sharedViews = view.savedViews.filter(viewItem => viewItem.shared);
    const myViews = view.savedViews.filter(viewItem => !viewItem.shared);

    return (
        <StyledListContainer>
            <div>
                <KitTypography.Title level="h4">{t('explorer.my-views')}</KitTypography.Title>
                <StyledList aria-label={t('explorer.my-views')}>
                    {myViews.map(viewItem => (
                        <StyleViewItemLi key={viewItem.id}>
                            <KitTypography.Text size="fontSize5" weight="medium" ellipsis>
                                {localizedTranslation(viewItem.label as Record<string, string>, [defaultLang])}
                            </KitTypography.Text>
                            <FaCheck className="check" />
                        </StyleViewItemLi>
                    ))}
                </StyledList>
            </div>
            <div>
                <KitTypography.Title level="h4">{t('explorer.shared-views')}</KitTypography.Title>
                <StyledList aria-label={t('explorer.shared-view')}>
                    <StyleViewItemLi className="selected">
                        <KitTypography.Text size="fontSize5" weight="medium" ellipsis>
                            {viewName}
                        </KitTypography.Text>
                        <FaCheck className="check" />
                    </StyleViewItemLi>
                    {sharedViews.map(viewItem => (
                        <StyleViewItemLi key={viewItem.id}>
                            <KitTypography.Text size="fontSize5" weight="medium" ellipsis>
                                {localizedTranslation(viewItem.label as Record<string, string>, [defaultLang])}
                            </KitTypography.Text>
                            <FaCheck className="check" />
                        </StyleViewItemLi>
                    ))}
                </StyledList>
            </div>
        </StyledListContainer>
    );
};
