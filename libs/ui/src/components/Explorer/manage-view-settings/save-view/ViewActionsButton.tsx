// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton} from 'aristid-ds';
import {FaShare} from 'react-icons/fa';
import {useCreateNewView} from './useCreateNewView';
import styled from 'styled-components';
import {useUpdateView} from './useUpdateView';
import {useResetView} from './useResetView';

const StyledFooter = styled.footer`
    display: flex;
    flex-direction: column;
    padding-bottom: calc(var(--general-spacing-xs) * 1px);
`;

export const ViewActionsButton = () => {
    const {t} = useSharedTranslation();
    const {updateViewButton} = useUpdateView();
    const {createNewViewButton} = useCreateNewView();
    const {resetViewButton} = useResetView();

    return (
        <StyledFooter>
            {updateViewButton}
            {createNewViewButton}
            <KitButton type="redirect" icon={<FaShare />} onClick={() => null}>
                {t('explorer.share-view')}
            </KitButton>
            {resetViewButton}
        </StyledFooter>
    );
};
