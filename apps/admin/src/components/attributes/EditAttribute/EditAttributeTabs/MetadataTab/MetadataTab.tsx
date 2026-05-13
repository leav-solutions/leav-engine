import {type GET_ATTRIBUTE_BY_ID_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import MetadataList from './MetadataList';
import {useSaveAttributeMutation} from '../../../../../_gqlTypes';

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
