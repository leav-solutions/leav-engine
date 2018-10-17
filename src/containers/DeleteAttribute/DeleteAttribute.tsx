import {DataProxy} from 'apollo-cache';
import {TranslationFunction} from 'i18next';
import * as React from 'react';
import {translate} from 'react-i18next';
import ConfirmedButton from 'src/components/ConfirmedButton';
import DeleteButton from 'src/components/DeleteButton';
import {DeleteAttributeMutation, deleteAttrQuery} from '../../queries/deleteAttributeMutation';
import {getAttributesQuery} from '../../queries/getAttributesQuery';
import {GET_ATTRIBUTES_attributes} from '../../_gqlTypes/GET_ATTRIBUTES';

interface IDeleteAttributeProps {
    attribute: GET_ATTRIBUTES_attributes;
    t: TranslationFunction;
}

class DeleteAttribute extends React.Component<IDeleteAttributeProps> {
    constructor(props: IDeleteAttributeProps) {
        super(props);
    }

    public render() {
        const {attribute, t} = this.props;

        return (
            <DeleteAttributeMutation mutation={deleteAttrQuery} update={this._updateCache}>
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
        );
    }

    private _updateCache(cache: DataProxy, {data: {deleteAttribute}}) {
        const cacheData: any = cache.readQuery({query: getAttributesQuery});
        cache.writeQuery({
            query: getAttributesQuery,
            data: {attributes: cacheData.attributes.filter(a => a.id !== deleteAttribute.id)}
        });
    }
}

export default translate()(DeleteAttribute);
