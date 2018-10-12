import {DataProxy} from 'apollo-cache';
import {TranslationFunction} from 'i18next';
import * as React from 'react';
import {translate} from 'react-i18next';
import {Confirm} from 'semantic-ui-react';
import DeleteButton from '../../components/DeleteButton';
import {DeleteAttributeMutation, deleteAttrQuery} from '../../queries/deleteAttributeMutation';
import {getAttributesQuery} from '../../queries/getAttributesQuery';
import {GET_ATTRIBUTES_attributes} from '../../_gqlTypes/GET_ATTRIBUTES';

interface IDeleteAttributeProps {
    attribute: GET_ATTRIBUTES_attributes;
    t: TranslationFunction;
}

interface IDeleteAttributeState {
    showConfirm: boolean;
}

class DeleteAttribute extends React.Component<IDeleteAttributeProps, IDeleteAttributeState> {
    constructor(props: IDeleteAttributeProps) {
        super(props);

        this.state = {
            showConfirm: false
        };
    }

    public render() {
        const {attribute, t} = this.props;
        const {showConfirm} = this.state;

        return (
            <DeleteAttributeMutation mutation={deleteAttrQuery} update={this._updateCache}>
                {deleteAttr => {
                    const onDelete = async (e: React.SyntheticEvent) => {
                        this._closeConfirm(e);
                        await deleteAttr({
                            variables: {attrId: attribute.id}
                        });
                    };

                    const attrLabel =
                        attribute.label !== null
                            ? attribute.label.fr || attribute.label.en || attribute.id
                            : attribute.id;

                    /**
                     * Prevent click on confirm modal from propagating to its parents
                     *
                     * @param e
                     */
                    const disableClick = (e: React.SyntheticEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                    };

                    return (
                        <div onClick={disableClick}>
                            <DeleteButton onDelete={this._openConfirm} />
                            <Confirm
                                open={showConfirm}
                                content={t('attributes.confirm_delete', {attrLabel})}
                                onCancel={this._closeConfirm}
                                onConfirm={onDelete}
                                cancelButton={t('admin.cancel')}
                                closeOnDocumentClick={false}
                                closeOnDimmerClick={false}
                            />
                        </div>
                    );
                }}
            </DeleteAttributeMutation>
        );
    }

    private _openConfirm = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({showConfirm: true});
    }
    private _closeConfirm = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({showConfirm: false});
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
