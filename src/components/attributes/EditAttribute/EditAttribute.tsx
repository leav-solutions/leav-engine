import {History} from 'history';
import React from 'react';
import {match} from 'react-router';
import {Dimmer} from 'semantic-ui-react';
import {AttributesQuery, getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {SaveAttributeMutation, saveAttributeQuery} from '../../../queries/attributes/saveAttributeMutation';
import {GET_ATTRIBUTES_attributes} from '../../../_gqlTypes/GET_ATTRIBUTES';
import Loading from '../../shared/Loading';
import EditAttributeForm from '../EditAttributeForm';

export interface IEditAttributeMatchParams {
    id: string;
}

interface IEditAttributeProps {
    match?: match<IEditAttributeMatchParams>;
    history?: History;
    attributeId?: number | null;
    afterSubmit?: (attrData: GET_ATTRIBUTES_attributes) => void;
}

function EditAttribute({match: routeMatch, attributeId, afterSubmit, history}: IEditAttributeProps): JSX.Element {
    const attrId = typeof attributeId !== 'undefined' ? attributeId : routeMatch ? routeMatch.params.id : '';

    const _getEditAttributeForm = (attrToEdit: GET_ATTRIBUTES_attributes | null): JSX.Element => (
        <SaveAttributeMutation mutation={saveAttributeQuery}>
            {(saveAttribute, {loading, error}) => {
                const onFormSubmit = async attrData => {
                    await saveAttribute({
                        variables: {
                            attrData: {
                                id: attrData.id,
                                label: {
                                    fr: attrData.label.fr,
                                    en: attrData.label.en
                                },
                                type: attrData.type,
                                format: attrData.format
                            }
                        },
                        refetchQueries: [
                            {query: getAttributesQuery, variables: {id: attrData.id}},
                            {query: getAttributesQuery}
                        ]
                    });

                    if (afterSubmit) {
                        afterSubmit(attrData);
                    }

                    if (history) {
                        history.replace({pathname: '/attributes/edit/' + attrData.id});
                    }
                };

                const formErrors = error && error.graphQLErrors.length ? error.graphQLErrors[0] : null;

                const onPermsSettingsSubmit = async attrData => {
                    if (attrToEdit === null) {
                        return;
                    }

                    await saveAttribute({
                        variables: {
                            attrData: {
                                id: attrToEdit.id,
                                label: attrToEdit.label,
                                type: attrToEdit.type,
                                format: attrToEdit.format,
                                permissionsConf: {
                                    permissionTreeAttributes: attrData.permissionsConf.permissionTreeAttributes,
                                    relation: attrData.permissionsConf.relation
                                }
                            }
                        },
                        refetchQueries: [{query: getAttributesQuery, variables: {id: attrData.id}}]
                    });
                };

                return (
                    <Dimmer.Dimmable className="flex-col height100">
                        {loading && <Loading withDimmer />}
                        <EditAttributeForm
                            attribute={attrToEdit}
                            onSubmit={onFormSubmit}
                            errors={formErrors}
                            onPermsSettingsSubmit={onPermsSettingsSubmit}
                        />
                    </Dimmer.Dimmable>
                );
            }}
        </SaveAttributeMutation>
    );

    return attrId ? (
        <AttributesQuery query={getAttributesQuery} variables={{id: '' + attrId}}>
            {({loading, error, data}) => {
                if (loading || !data) {
                    return <Loading />;
                }
                if (typeof error !== 'undefined') {
                    return <p>Error: {error.message}</p>;
                }

                if (data.attributes === null) {
                    return <p>Unknown attribute</p>;
                }

                return _getEditAttributeForm(data.attributes[0]);
            }}
        </AttributesQuery>
    ) : (
        _getEditAttributeForm(null)
    );
}

export default EditAttribute;
