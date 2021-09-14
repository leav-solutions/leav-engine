// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useCallback, useEffect, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import {Divider, Form} from 'semantic-ui-react';
import {
    GET_ATTRIBUTES_VALUES_LIST_attributes_list,
    GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute,
    GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute
} from '../../../../../../_gqlTypes/GET_ATTRIBUTES_VALUES_LIST';
import {AttributeType, ValuesListConfInput} from '../../../../../../_gqlTypes/globalTypes';
import {ILinkValuesList, ITreeValuesList, IValuesListConf, ValuesList} from '../../../../../../_types/attributes';
import LinkValuesList from './LinkValuesList';
import StandardValuesList from './StandardValuesList';
import TreeValuesList from './TreeValuesList';

interface IValuesListFormProps {
    attribute: GET_ATTRIBUTES_VALUES_LIST_attributes_list;
    onSubmit: (valuesListConf: ValuesListConfInput) => void;
}

interface IValuesFormState {
    execSubmit: boolean;
    conf: IValuesListConf;
}

const reducer = (state: IValuesFormState, action) => {
    const newConf = {...state.conf};
    let execSubmit = true;

    switch (action.type) {
        case 'toggle_enable':
            newConf.enable = !newConf.enable;
            break;
        case 'toggle_allow_free_entry':
            newConf.allowFreeEntry = !newConf.allowFreeEntry;
            break;
        case 'change_values':
            if (JSON.stringify(newConf.values) === JSON.stringify(action.values)) {
                // Don't update values as nothing has changed
                execSubmit = false;
            }
            newConf.values = [...new Set<string>(action.values)];
            break;
        case 'submit_done':
            execSubmit = false;
            break;
    }

    return {...state, execSubmit, conf: newConf};
};

const valuesFieldByType = {
    [AttributeType.simple]: 'values',
    [AttributeType.advanced]: 'values',
    [AttributeType.simple_link]: 'linkValues',
    [AttributeType.advanced_link]: 'linkValues',
    [AttributeType.tree]: 'treeValues'
};

function ValuesListForm({attribute, onSubmit}: IValuesListFormProps): JSX.Element {
    const {t} = useTranslation();

    const initialState: IValuesFormState = {execSubmit: false, conf: {enable: false}};

    if (attribute.values_list) {
        initialState.conf = {
            ...attribute.values_list,
            values: attribute.values_list[valuesFieldByType[attribute.type]]
        };
    }

    const [state, dispatch] = useReducer(reducer, initialState);

    const _toggleEnable = () => dispatch({type: 'toggle_enable'});
    const _toggleAllowFreeEntry = () => dispatch({type: 'toggle_allow_free_entry'});

    const _extractValuesToSave = useCallback(
        (conf: IValuesListConf): string[] => {
            let valuesToSave: string[] = [];

            switch (attribute.type) {
                case AttributeType.simple:
                case AttributeType.advanced:
                    valuesToSave = (conf?.values || []) as string[];
                    break;
                case AttributeType.simple_link:
                case AttributeType.advanced_link:
                    const linkValues = conf.values as ILinkValuesList[];
                    valuesToSave = linkValues ? linkValues.map(v => v.whoAmI.id) : [];
                    break;
                case AttributeType.tree:
                    const treeValues = conf.values as ITreeValuesList[];
                    valuesToSave = treeValues
                        ? treeValues.map(v => `${v.record.whoAmI.library.id}/${v.record.whoAmI.id}`)
                        : [];
                    break;
            }

            return valuesToSave.filter(v => v !== '');
        },
        [attribute]
    );

    const _handleValuesChange = (newValues: ValuesList) => {
        dispatch({type: 'change_values', values: newValues});
    };

    useEffect(() => {
        // Submit if something has changed
        if (state.execSubmit) {
            onSubmit({
                enable: state.conf.enable,
                allowFreeEntry: state.conf.allowFreeEntry,
                values: _extractValuesToSave(state.conf)
            });
            dispatch({type: 'submit_done'});
        }
    }, [state, _extractValuesToSave, onSubmit]);

    const _getListByType = (attrType: AttributeType) => {
        switch (attrType) {
            case AttributeType.simple:
            case AttributeType.advanced:
                return (
                    <StandardValuesList
                        values={state.conf.values || []}
                        onValuesUpdate={_handleValuesChange}
                        attribute={attribute}
                    />
                );
            case AttributeType.simple_link:
            case AttributeType.advanced_link:
                return (
                    <LinkValuesList
                        values={(state.conf.values as ILinkValuesList[]) || []}
                        onValuesUpdate={_handleValuesChange}
                        linkedLibrary={
                            (attribute as GET_ATTRIBUTES_VALUES_LIST_attributes_list_LinkAttribute).linked_library
                                ?.id || ''
                        }
                    />
                );
            case AttributeType.tree:
                return (
                    <TreeValuesList
                        values={(state.conf.values as ITreeValuesList[]) || []}
                        onValuesUpdate={_handleValuesChange}
                        linkedTree={
                            (attribute as GET_ATTRIBUTES_VALUES_LIST_attributes_list_TreeAttribute).linked_tree?.id ||
                            ''
                        }
                    />
                );
        }
    };

    return (
        <Form>
            <Form.Group inline={false}>
                <Form.Checkbox
                    name="enable"
                    toggle
                    label={t('attributes.values_list_enable')}
                    checked={state.conf.enable}
                    onChange={_toggleEnable}
                />
                {state.conf.enable && (
                    <Form.Checkbox
                        name="allowFreeEntry"
                        toggle
                        label={t('attributes.allow_free_entry')}
                        checked={!!state.conf.allowFreeEntry}
                        onChange={_toggleAllowFreeEntry}
                    />
                )}
            </Form.Group>
            {state.conf.enable && (
                <>
                    <Divider horizontal>{t('attributes.values')}</Divider>
                    {_getListByType(attribute.type)}
                </>
            )}
        </Form>
    );
}

export default ValuesListForm;
