// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitRadio, KitSpace, KitTag} from 'aristid-ds';
import {RadioChangeEvent} from 'aristid-ds/dist/Kit/DataEntry/Radio';
import {FunctionComponent} from 'react';
import styled from 'styled-components';
import {DisplayModeTable} from './DisplayModeTable';
import {ViewSettingsActionTypes} from './viewSettingsReducer';
import {useViewSettingsContext} from './useViewSettingsContext';

const StyledWrapperDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-l) * 1px);

    .ant-radio-wrapper {
        padding: calc(var(--general-spacing-xs) * 1px);
    }
`;

interface IDisplayModeProps {
    library: string;
}

export const DisplayMode: FunctionComponent<IDisplayModeProps> = ({library}) => {
    const {t} = useSharedTranslation();
    const {view, dispatch} = useViewSettingsContext();

    const _handleDisplayModeChange = (event: RadioChangeEvent) => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_DISPLAY_MODE,
            payload: {
                displayMode: event.target.value
            }
        });
    };

    const comingSoonTag = <KitTag type="secondary" idCardProps={{description: String(t('explorer.coming-soon'))}} />;

    return (
        <StyledWrapperDiv>
            <KitRadio.Group value={view.displayMode} onChange={_handleDisplayModeChange}>
                <KitSpace direction="vertical" size={0}>
                    <KitRadio value="list" disabled>
                        <KitSpace>
                            {t('explorer.display-mode-list')} {comingSoonTag}
                        </KitSpace>
                    </KitRadio>
                    <KitRadio value="table">{t('explorer.display-mode-table')}</KitRadio>
                    <KitRadio value="mosaic" disabled>
                        <KitSpace>
                            {t('explorer.display-mode-mosaic')} {comingSoonTag}
                        </KitSpace>
                    </KitRadio>
                    <KitRadio value="planning" disabled>
                        <KitSpace>
                            {t('explorer.display-mode-planning')} {comingSoonTag}
                        </KitSpace>
                    </KitRadio>
                </KitSpace>
            </KitRadio.Group>
            {view.displayMode === 'table' && <DisplayModeTable library={library} />}
        </StyledWrapperDiv>
    );
};
