import {i18n, TranslationFunction} from 'i18next';
import * as React from 'react';
import {translate} from 'react-i18next';
import ConfirmedButton from 'src/components/ConfirmedButton';
import DeleteButton from 'src/components/DeleteButton';
import {getAttributesQueryName} from 'src/queries/getAttributesQuery';
import {DeleteAttributeMutation, deleteAttrQuery} from '../../queries/deleteAttributeMutation';
import {GET_ATTRIBUTES_attributes} from '../../_gqlTypes/GET_ATTRIBUTES';

interface IDeleteAttributeProps {
    attribute?: GET_ATTRIBUTES_attributes;
    t: TranslationFunction;
    i18n: i18n;
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

export default translate()(DeleteAttribute);
