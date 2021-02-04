// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Form, Header, Icon, Input} from 'semantic-ui-react';
import styled from 'styled-components';
import AttributeSelector from '../../../../../../../../../attributes/AttributeSelector';
import {FormBuilderActionTypes, IFormBuilderStateAndDispatch} from '../../formBuilderReducer/formBuilderReducer';

const SettingsWrapper = styled.div`
    padding: 1.5em;
`;

const CloseIcon = styled(Icon)`
    float: right;
    cursor: pointer;
`;

function SettingsEdition({state, dispatch}: IFormBuilderStateAndDispatch): JSX.Element {
    const {elementInSettings} = state;
    const {t} = useTranslation();

    const _closeSettings = useCallback(() => dispatch({type: FormBuilderActionTypes.CLOSE_SETTINGS}), [dispatch]);

    useEffect(() => {
        const _handleEsc = event => {
            if (event.keyCode === 27) {
                _closeSettings();
            }
        };
        window.addEventListener('keydown', _handleEsc);

        return () => {
            window.removeEventListener('keydown', _handleEsc);
        };
    }, [_closeSettings]);

    if (!elementInSettings) {
        return <div>NO ELEMENT TO EDIT</div>;
    }

    const _handleKeyPress = e => {
        if (e.key === 'Escape') {
            _closeSettings();
        }
    };

    const _handleChange = (e, data) => {
        dispatch({
            type: FormBuilderActionTypes.SAVE_SETTINGS,
            settings: {
                [data.name]: data.value
            }
        });
    };

    if (!elementInSettings) {
        return <div>Invalid Element</div>;
    }

    return (
        <SettingsWrapper onKeyDown={_handleKeyPress}>
            <Header dividing>
                <CloseIcon name="cancel" onClick={_closeSettings} />
                <Icon name="settings" />
                <Header.Content>{t('admin.settings')}</Header.Content>
            </Header>
            <Form>
                {(elementInSettings?.uiElement?.settings || []).map(key =>
                    key === 'attribute' ? (
                        <AttributeSelector
                            key={key}
                            placeholder="Select an attribute"
                            label={'Attribute'}
                            name="attribute"
                            onChange={_handleChange}
                            filters={{
                                libraries: [state.library]
                            }}
                            value={elementInSettings?.settings?.attribute}
                        />
                    ) : (
                        <Form.Field key={key}>
                            <label>{key}</label>
                            <Input
                                type="text"
                                name={key}
                                onChange={_handleChange}
                                onKeyDown={_handleKeyPress}
                                value={elementInSettings?.settings?.[key] || ''}
                            />
                        </Form.Field>
                    )
                )}
            </Form>
        </SettingsWrapper>
    );
}

export default SettingsEdition;
