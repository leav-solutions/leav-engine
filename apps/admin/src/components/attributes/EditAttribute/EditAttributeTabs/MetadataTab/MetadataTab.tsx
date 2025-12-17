// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import MetadataList from './MetadataList';
import {useSaveAttributeMutation} from '_gqlTypes';

interface IMetadataTabProps {
    attribute: GET_ATTRIBUTE_BY_ID_attributes_list;
    readonly: boolean;
}

function MetadataTab({attribute, readonly}: IMetadataTabProps): JSX.Element {
    const [saveAttribute] = useSaveAttributeMutation();

    const _handleChange = (fields: string[]) =>
        saveAttribute({
            variables: {attrData: {id: attribute.id, metadata_fields: fields}},
            refetchQueries: [{query: getAttributesQuery, variables: {id: attribute.id}}],
        });

    return <MetadataList fields={attribute.metadata_fields || []} readonly={readonly} onChange={_handleChange} />;
}

export default MetadataTab;
