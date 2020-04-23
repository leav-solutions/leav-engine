import {useQuery} from '@apollo/react-hooks';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Modal} from 'semantic-ui-react';
import {getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {
    GET_ATTRIBUTES,
    GET_ATTRIBUTESVariables,
    GET_ATTRIBUTES_attributes_list
} from '../../../_gqlTypes/GET_ATTRIBUTES';
import Loading from '../../shared/Loading';
import AttributesSelectionList from './AttributesSelectionList';

interface IAttributesSelectionProps {
    onSubmit: (selectedAttributes: string[]) => void;
    openModal: boolean;
    onClose: () => void;
    selection: string[];
    filter?: GET_ATTRIBUTESVariables;
}

const AttributesSelectionModal = ({
    openModal,
    selection,
    onClose,
    onSubmit,
    filter
}: IAttributesSelectionProps): JSX.Element => {
    const {t} = useTranslation();
    const [pendingSelection, setPendingSelection] = useState<string[]>([]);
    const {loading, error, data} = useQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(getAttributesQuery, {
        variables: filter
    });

    const _handleclose = () => {
        setPendingSelection([]);
        onClose();
    };

    const _handleSubmit = () => {
        onSubmit(pendingSelection);
    };

    const _toggleSelection = (selectedAttr: GET_ATTRIBUTES_attributes_list) => {
        const newSelection =
            pendingSelection.indexOf(selectedAttr.id) !== -1
                ? pendingSelection.filter(aId => aId !== selectedAttr.id)
                : [...pendingSelection, selectedAttr.id];

        setPendingSelection(newSelection);
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div className="error">Error: {error.message}</div>;
    }

    if (!data || !data.attributes) {
        return <></>;
    }

    return (
        data.attributes && (
            <Modal size="small" open={openModal} onClose={_handleclose} centered closeOnDimmerClick closeOnEscape>
                <Modal.Header>{t('libraries.link_existing_attribute')}</Modal.Header>
                <Modal.Content scrolling>
                    <AttributesSelectionList
                        attributes={data.attributes.list.filter(a => selection.indexOf(a.id) === -1)}
                        selection={pendingSelection}
                        toggleSelection={_toggleSelection}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={_handleclose}>{t('admin.cancel')}</Button>
                    <Button onClick={_handleSubmit}>{t('admin.submit')}</Button>
                </Modal.Actions>
            </Modal>
        )
    );
};

export default AttributesSelectionModal;
