import {TranslationFunction} from 'i18next';
import * as React from 'react';
import {translate} from 'react-i18next';
import {Button, Modal} from 'semantic-ui-react';
import AttributesSelectionList from 'src/components/AttributesSelectionList';
import Loading from 'src/components/Loading';
import {AttributesQuery, getAttributesQuery} from 'src/queries/getAttributesQuery';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';

interface IAttributesSelectionProps {
    onSubmit: (selectedAttributes: string[]) => void;
    t: TranslationFunction;
    openModal: boolean;
    onClose: () => void;
    selection: string[];
}

interface IAttributesSelectionState {
    pendingSelection: string[];
}

class AttributesSelectionModal extends React.Component<IAttributesSelectionProps, IAttributesSelectionState> {
    constructor(props: IAttributesSelectionProps) {
        super(props);

        this.state = {
            pendingSelection: []
        };
    }

    public render() {
        const {t, openModal, selection} = this.props;
        const {pendingSelection} = this.state;
        return (
            <AttributesQuery query={getAttributesQuery}>
                {({loading, error, data}) => {
                    if (loading || !data) {
                        return <Loading />;
                    }
                    if (typeof error !== 'undefined') {
                        return <p>Error: {error.message}</p>;
                    }

                    return (
                        data.attributes && (
                            <Modal
                                size="small"
                                open={openModal}
                                onClose={this._handleclose}
                                centered
                                closeOnDimmerClick
                                closeOnEscape
                            >
                                <Modal.Header>{t('libraries.link_existing_attribute')}</Modal.Header>
                                <Modal.Content scrolling>
                                    <AttributesSelectionList
                                        attributes={data.attributes.filter(a => selection.indexOf(a.id) === -1)}
                                        selection={pendingSelection}
                                        toggleSelection={this._toggleSelection}
                                    />
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button onClick={this._handleclose}>{t('admin.cancel')}</Button>
                                    <Button onClick={this._handleSubmit}>{t('admin.submit')}</Button>
                                </Modal.Actions>
                            </Modal>
                        )
                    );
                }}
            </AttributesQuery>
        );
    }

    private _handleclose = () => {
        this.setState({pendingSelection: []});
        this.props.onClose();
    }

    private _handleSubmit = () => {
        this.props.onSubmit(this.state.pendingSelection);
    }

    private _toggleSelection = (selectedAttr: GET_ATTRIBUTES_attributes) => {
        const {pendingSelection} = this.state;

        const newSelection =
            pendingSelection.indexOf(selectedAttr.id) !== -1
                ? pendingSelection.filter(aId => aId !== selectedAttr.id)
                : [...pendingSelection, selectedAttr.id];

        this.setState({pendingSelection: newSelection});
    }
}

export default translate()(AttributesSelectionModal);
