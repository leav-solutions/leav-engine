import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {DeleteAttributeMutation, deleteAttrQuery} from '../../../queries/attributes/deleteAttributeMutation';
import {getAttributesQueryName} from '../../../queries/attributes/getAttributesQuery';
import {GET_ATTRIBUTES_attributes} from '../../../_gqlTypes/GET_ATTRIBUTES';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteAttributeProps extends WithNamespaces {
    attribute?: GET_ATTRIBUTES_attributes;
}

class DeleteAttribute extends React.Component<IDeleteAttributeProps> {
    constructor(props: IDeleteAttributeProps) {
        super(props);
    }

    public render() {
        const {attribute, t} = this.props;

        return !!attribute ? (
            <DeleteAttributeMutation mutation={deleteAttrQuery} refetchQueries={[getAttributesQueryName]}>
                {deleteAttr => {
                    const onDelete = async () =>
                        deleteAttr({
                            variables: {attrId: attribute.id}
                        });

                    const attrLabel =
                        attribute.label !== null
                            ? attribute.label.fr || attribute.label.en || attribute.id
                            : attribute.id;

                    return (
                        <ConfirmedButton action={onDelete} confirmMessage={t('attributes.confirm_delete', {attrLabel})}>
                            <DeleteButton disabled={attribute.system} />
                        </ConfirmedButton>
                    );
                }}
            </DeleteAttributeMutation>
        ) : (
            ''
        );
    }
}

export default withNamespaces()(DeleteAttribute);
