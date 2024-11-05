// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Form, Icon, Modal} from 'semantic-ui-react';
import styled from 'styled-components';
import {FormBuilderActionTypes} from '../../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../../formBuilderReducer/hook/useFormBuilderReducer';
import SettingsField from './SettingsField';
import {FormElementSettingsInputTypes} from '../../_types';
import SettingsTranslatedField from './SettingsTranslatedField';

const SettingsWrapper = styled.div`
    padding: 1.5em;
    min-height: calc(100vh - 24rem);
`;

function SettingsEdition(): JSX.Element {
    const {
        state: {elementInSettings, openSettings, library},
        dispatch
    } = useFormBuilderReducer();

    const {t} = useTranslation();

    const _closeSettings = useCallback(() => dispatch({type: FormBuilderActionTypes.CLOSE_SETTINGS}), [dispatch]);

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
                            {(elementInSettings.uiElement?.settings || []).map(settingsField =>
                                settingsField.inputType === FormElementSettingsInputTypes.TRANSLATED_INPUT ? (
                                    <SettingsTranslatedField key={settingsField.name} settingsField={settingsField} />
                                ) : (
                                    <SettingsField key={settingsField.name} settingsField={settingsField} />
                                )
                            )}
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
