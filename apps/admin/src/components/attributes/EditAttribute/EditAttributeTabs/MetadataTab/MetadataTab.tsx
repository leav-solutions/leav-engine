// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import React from 'react';
import {GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '../../../../../_gqlTypes/SAVE_ATTRIBUTE';
import MetadataList from './MetadataList';

interface IMetadataTabProps {
    attribute: GET_ATTRIBUTE_BY_ID_attributes_list;
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
