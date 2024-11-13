import {useGetAttributesByLibQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitRadio, KitSpace, KitTypography} from 'aristid-ds';
import {RadioChangeEvent} from 'aristid-ds/dist/Kit/DataEntry/Radio';
import {FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {DisplayModeTable} from './DisplayModeTable';

const StyledWrapper = styled.div`
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

export const DisplayMode: FunctionComponent<IDisplayModeProps> = ({library = 'users'}) => {
    const {t} = useSharedTranslation();
    const [currrentDisplayMode, setCurrentDisplayMode] = useState<string>('table');

    const _handleDisplayModeChange = (event: RadioChangeEvent) => {
        setCurrentDisplayMode(event.target.value);
    };

    return (
        <StyledWrapper>
            <KitRadio.Group value={currrentDisplayMode} onChange={_handleDisplayModeChange}>
                <KitSpace direction="vertical" size={0}>
                    <KitRadio value="list">{t('explorer.display-mode-list')}</KitRadio>
                    <KitRadio value="table">{t('explorer.display-mode-table')}</KitRadio>
                    <KitRadio value="mosaic">{t('explorer.display-mode-mosaic')}</KitRadio>
                    <KitRadio value="planning">{t('explorer.display-mode-planning')}</KitRadio>
                </KitSpace>
            </KitRadio.Group>
            {currrentDisplayMode === 'table' && <DisplayModeTable library={library} />}
            {currrentDisplayMode !== 'table' && (
                <KitTypography.Text>{t(`explorer.display-mode-${currrentDisplayMode}`)}</KitTypography.Text>
            )}
        </StyledWrapper>
    );
};
