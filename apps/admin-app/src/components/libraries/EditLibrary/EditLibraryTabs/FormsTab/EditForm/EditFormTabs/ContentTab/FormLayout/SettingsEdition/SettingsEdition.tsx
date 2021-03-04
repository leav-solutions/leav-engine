// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Form, Icon, Modal} from 'semantic-ui-react';
import styled from 'styled-components';
import {FormBuilderActionTypes} from '../../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../../formBuilderReducer/hook/useFormBuilderReducer';
import {FormElementSettingsInputTypes, SettingsOnChangeFunc} from '../../_types';
import SettingsAttribute from './SettingsInput/SettingsAttribute';
import SettingsCheckbox from './SettingsInput/SettingsCheckbox';
import SettingsRTE from './SettingsInput/SettingsRTE';
import SettingsSelect from './SettingsInput/SettingsSelect';
import SettingsTextInput from './SettingsInput/SettingsTextInput';

const SettingsWrapper = styled.div`
    padding: 1.5em;
    min-height: calc(100vh - 24rem);
`;

function SettingsEdition(): JSX.Element {
    const {
        state: {elementInSettings, openSettings},
        dispatch
    } = useFormBuilderReducer();

    const {t} = useTranslation();

    const _closeSettings = useCallback(() => dispatch({type: FormBuilderActionTypes.CLOSE_SETTINGS}), [dispatch]);

    const _handleChange: SettingsOnChangeFunc = (name, value) => {
        dispatch({
            type: FormBuilderActionTypes.SAVE_SETTINGS,
            settings: {
                [name]: value
            }
        });
    };

    return (
        <Modal
            open={openSettings}
            onClose={_closeSettings}
            closeOnDimmerClick
            closeOnEscape
            closeIcon
            dimmer
            size="large"
            className="scrolling"
        >
            <Modal.Header>
                <Icon name="settings" /> {t('admin.settings')}
            </Modal.Header>
            <Modal.Content scrolling>
                {elementInSettings && (
                    <SettingsWrapper>
                        <Form name="settings-edition">
                            {(elementInSettings.uiElement?.settings || []).map(settingsField => {
                                if (settingsField.inputType === FormElementSettingsInputTypes.NONE) {
                                    return null;
                                }

                                let comp: JSX.Element;
                                const compProps = {
                                    onChange: _handleChange,
                                    settingsField
                                };
                                switch (settingsField.inputType) {
                                    case FormElementSettingsInputTypes.ATTRIBUTE_SELECTION:
                                        comp = <SettingsAttribute {...compProps} />;
                                        break;
                                    case FormElementSettingsInputTypes.CHECKBOX:
                                        comp = <SettingsCheckbox {...compProps} />;
                                        break;
                                    case FormElementSettingsInputTypes.RTE:
                                        comp = <SettingsRTE {...compProps} />;
                                        break;
                                    case FormElementSettingsInputTypes.SELECT:
                                        comp = <SettingsSelect {...compProps} />;
                                        break;
                                    default:
                                        comp = <SettingsTextInput {...compProps} />;
                                }

                                return (
                                    <Form.Field key={settingsField.name}>
                                        <label>{t(`forms.settings.${settingsField.name}`)}</label>
                                        {comp}
                                    </Form.Field>
                                );
                            })}
                        </Form>
                    </SettingsWrapper>
                )}
            </Modal.Content>
            <Modal.Actions>
                <Button className="close-button" onClick={_closeSettings}>
                    <Icon name="close" /> {t('admin.close')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default SettingsEdition;
