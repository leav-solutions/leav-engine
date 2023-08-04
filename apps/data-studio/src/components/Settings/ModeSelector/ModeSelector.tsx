// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Checkbox, CheckboxOptionType, Popconfirm, Radio, RadioChangeEvent} from 'antd';
import {CheckboxValueType} from 'antd/lib/checkbox/Group';
import {useApplicationContext} from 'context/ApplicationContext';
import {useState} from 'react';
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
    selectedMode: SelectionMode;
    entityType: 'trees' | 'libraries';
}

function ModeSelector({onChange, entityType, selectedMode}: IModeSelectorProps): JSX.Element {
    const {t} = useTranslation();
    const [isSelectionModeConfirmOpen, setIsSelectionModeConfirmOpen] = useState(false);
    const [pendingValueSave, setPendingValueSave] = useState<SelectionMode>();
    const {currentApp} = useApplicationContext();
    const currentAppLibrariesSettings = currentApp?.settings?.libraries;

    const _handleOpenSelectionModeConfirm = () => setIsSelectionModeConfirmOpen(true);
    const _handleCloseSelectionModeConfirm = () => setIsSelectionModeConfirmOpen(false);

    const _handleSelectionModeChange = async (values: CheckboxValueType[]) => {
        const value = values.filter(e => e !== selectedMode)[0] as SelectionMode;

        setPendingValueSave(value as SelectionMode);

        if ((value === 'all' || value === 'none') && selectedMode === 'custom') {
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
        setPendingValueSave(null);
        onChange(valueToSave);
    };

    const selectionModeOptions: CheckboxOptionType[] = [
        {
            label: t(`app_settings.${entityType}_settings.select_all`),
            value: 'all'
        },
        {
            label: t(`app_settings.${entityType}_settings.select_none`),
            value: 'none'
        },
        {
            label: t(`app_settings.${entityType}_settings.select_custom`),
            value: 'custom'
        }
    ];

    const helpText: {[key in SelectionMode]: string} = {
        all: t(`app_settings.${entityType}_settings.select_all_help`),
        none: t(`app_settings.${entityType}_settings.select_none_help`),
        custom: t(`app_settings.${entityType}_settings.select_custom_help`)
    };

    return (
        <Wrapper>
            <label>{t(`app_settings.${entityType}_settings.available`)}:</label>
            <div style={{margin: '5px'}}>
                <Popconfirm
                    okText={t('global.submit')}
                    cancelText={t('global.cancel')}
                    title={t('app_settings.mode_confirm_title')}
                    description={t('app_settings.mode_confirm_description')}
                    open={isSelectionModeConfirmOpen}
                    onConfirm={_handleSelectionModeConfirm}
                    onCancel={_handleCloseSelectionModeConfirm}
                >
                    <Checkbox.Group
                        options={selectionModeOptions}
                        value={[selectedMode]}
                        onChange={_handleSelectionModeChange}
                    />
                </Popconfirm>
                <HelpText>{helpText[selectedMode]}</HelpText>
            </div>
        </Wrapper>
    );
}

export default ModeSelector;
