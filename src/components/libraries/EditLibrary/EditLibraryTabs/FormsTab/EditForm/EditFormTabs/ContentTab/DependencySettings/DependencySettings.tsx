import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dropdown} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../../../../utils';
import {FormBuilderActionTypes, IFormBuilderStateAndDispatch} from '../formBuilderReducer/formBuilderReducer';

const StyledDropdown = styled(Dropdown)`
    margin: 2em 0;
`;
StyledDropdown.displayName = 'Dropdown';

function DependencySettings({state, dispatch}: IFormBuilderStateAndDispatch): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();

    if (!state.form.dependencyAttributes || !state.form.dependencyAttributes.length) {
        return <></>;
    }

    const options = state.form.dependencyAttributes.map(attr => ({
        text: localizedLabel(attr.label, lang),
        value: attr.id
    }));

    const _handleChange = (_, data) => {
        return dispatch({
            type: FormBuilderActionTypes.CHANGE_ACTIVE_DEPENDENCY,
            activeDependency: {
                attribute: data.value,
                value: null,
                ancestors: []
            }
        });
    };

    return (
        <StyledDropdown
            data-test-id="attribute-selection"
            selection
            fluid
            clearable
            options={options}
            placeholder={t('forms.select_attribute')}
            onChange={_handleChange}
        />
    );
}

export default DependencySettings;
