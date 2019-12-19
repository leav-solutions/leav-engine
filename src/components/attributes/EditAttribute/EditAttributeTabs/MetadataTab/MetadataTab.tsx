import {useMutation} from '@apollo/react-hooks';
import React from 'react';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '../../../../../_gqlTypes/SAVE_ATTRIBUTE';
import MetadataList from './MetadataList';

interface IMetadataTabProps {
    attribute: GET_ATTRIBUTES_attributes_list;
    readonly: boolean;
}

function MetadataTab({attribute, readonly}: IMetadataTabProps): JSX.Element {
    const [saveAttribute] = useMutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(saveAttributeQuery);

    const _handleChange = (fields: string[]) =>
        saveAttribute({
            variables: {attrData: {id: attribute.id, metadata_fields: fields}},
            refetchQueries: [{query: getAttributesQuery, variables: {id: attribute.id}}]
        });

    return <MetadataList fields={attribute.metadata_fields || []} readonly={readonly} onChange={_handleChange} />;
}

export default MetadataTab;
