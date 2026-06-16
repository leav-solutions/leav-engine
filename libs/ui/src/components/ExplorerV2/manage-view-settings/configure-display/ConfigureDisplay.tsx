import {type FunctionComponent} from 'react';
import styled from 'styled-components';
import {type RadioGroupProps} from 'aristid-ds/dist/Kit/DataEntry/Radio';
import {ViewSettingsActionTypes} from './../store-view-settings/viewSettingsReducer';
import {useViewSettingsContext} from './../store-view-settings/useViewSettingsContext';
import {SelectVisibleAttributes} from './attributes/SelectVisibleAttributes';
import {SelectViewType} from './view-type/SelectViewType';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const StyledWrapperDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-l) * 1px);

    .ant-radio-wrapper {
        padding: calc(var(--general-spacing-xs) * 1px);
    }
`;

interface IConfigureDisplayProps {
    libraryId: string;
}

export const ConfigureDisplay: FunctionComponent<IConfigureDisplayProps> = ({libraryId}) => {
    const {view, dispatch} = useViewSettingsContext();
    const {t} = useSharedTranslation();

    const _handleViewTypeChange: RadioGroupProps['onChange'] = event => {
        dispatch({
            type: ViewSettingsActionTypes.RESTORE_INITIAL_VIEW_SETTINGS,
        });
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_VIEW_TYPE,
            payload: {
                viewType: event.target.value,
            },
        });
    };

    return (
        <StyledWrapperDiv>
            <SelectViewType value={view.viewType} onChange={_handleViewTypeChange} />
            {view.viewType === 'table' && (
                <SelectVisibleAttributes
                    mainTitle={t('explorer.columns')}
                    visibleListTitle={t('explorer.visible-columns')}
                    invisibleListTitle={t('explorer.invisible-columns')}
                    libraryId={libraryId}
                />
            )}
            {view.viewType === 'timeline' && (
                <SelectVisibleAttributes
                    mainTitle={t('explorer.available-attributes-for-users')}
                    visibleListTitle={t('explorer.visible-attributes')}
                    invisibleListTitle={t('explorer.invisible-attributes')}
                    libraryId={libraryId}
                />
            )}
        </StyledWrapperDiv>
    );
};
