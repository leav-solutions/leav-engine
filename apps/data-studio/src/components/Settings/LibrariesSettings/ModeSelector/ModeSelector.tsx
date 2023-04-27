// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckboxOptionType, Popconfirm, Radio, RadioChangeEvent} from 'antd';
import {useApplicationContext} from 'context/ApplicationContext';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    gap: 1rem;
    align-items: flex-start;

    > label {
        padding-top: 5px;
    }
`;

const HelpText = styled.div`
    font-size: 0.8rem;
    color: ${props => props.theme.antd?.colorTextSecondary};
`;

type SelectionMode = 'all' | 'none' | 'custom';

interface IModeSelectorProps {
    onChange: (mode: SelectionMode) => void;
}

function ModeSelector({onChange}: IModeSelectorProps): JSX.Element {
    const {t} = useTranslation();
    const [isSelectionModeConfirmOpen, setIsSelectionModeConfirmOpen] = useState(false);
    const [currentMode, setCurrentMode] = useState<SelectionMode>();
    const [pendingValueSave, setPendingValueSave] = useState<SelectionMode>();
    const {currentApp} = useApplicationContext();
    const currentAppLibrariesSettings = currentApp?.settings?.libraries;

    useEffect(() => {
        const selectedMode = Array.isArray(currentAppLibrariesSettings) ? 'custom' : currentAppLibrariesSettings;
        setCurrentMode(selectedMode);
    }, [currentAppLibrariesSettings]);

    const _handleOpenSelectionModeConfirm = () => setIsSelectionModeConfirmOpen(true);
    const _handleCloseSelectionModeConfirm = () => setIsSelectionModeConfirmOpen(false);

    const _handleSelectionModeChange = async (e: RadioChangeEvent) => {
        const value = e.target.value;
        setPendingValueSave(value);

        if ((value === 'all' || value === 'none') && currentMode === 'custom') {
            _handleOpenSelectionModeConfirm();
        } else {
            _handleSelectionModeSave(value);
        }
    };

    const _handleSelectionModeConfirm = () => {
        _handleSelectionModeSave();
        _handleCloseSelectionModeConfirm();
    };

    const _handleSelectionModeSave = async (value?: SelectionMode) => {
        const valueToSave = value ?? pendingValueSave;
        setCurrentMode(valueToSave);
        setPendingValueSave(null);
        onChange(valueToSave);
    };

    const selectionModeOptions: CheckboxOptionType[] = [
        {
            label: t('app_settings.libraries_select_all'),
            value: 'all'
        },
        {
            label: t('app_settings.libraries_select_none'),
            value: 'none'
        },
        {
            label: t('app_settings.libraries_select_custom'),
            value: 'custom'
        }
    ];

    const helpText: {[key in SelectionMode]: string} = {
        all: t('app_settings.libraries_select_all_help'),
        none: t('app_settings.libraries_select_none_help'),
        custom: t('app_settings.libraries_select_custom_help')
    };

    return (
        <Wrapper>
            <label>{t('app_settings.available_libraries')}:</label>
            <div>
                <Popconfirm
                    okText={t('global.submit')}
                    cancelText={t('global.cancel')}
                    title={t('app_settings.libraries_mode_confirm_title')}
                    description={t('app_settings.libraries_mode_confirm_description')}
                    open={isSelectionModeConfirmOpen}
                    onConfirm={_handleSelectionModeConfirm}
                    onCancel={_handleCloseSelectionModeConfirm}
                >
                    <Radio.Group
                        options={selectionModeOptions}
                        optionType="button"
                        buttonStyle="solid"
                        value={currentMode}
                        onChange={_handleSelectionModeChange}
                    />
                </Popconfirm>
                <HelpText>{helpText[currentMode]}</HelpText>
            </div>
        </Wrapper>
    );
}

export default ModeSelector;
