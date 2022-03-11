// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Modal} from 'semantic-ui-react';
import {SAVE_LIBRARY_ATTRIBUTES, SAVE_LIBRARY_ATTRIBUTESVariables} from '_gqlTypes/SAVE_LIBRARY_ATTRIBUTES';
import {getLibByIdQuery} from '../../../../../queries/libraries/getLibraryById';
import {saveLibAttributesMutation} from '../../../../../queries/libraries/saveLibAttributesMutation';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {GET_LIB_BY_ID_libraries_list} from '../../../../../_gqlTypes/GET_LIB_BY_ID';
import AttributesList from '../../../../attributes/AttributesList';
import AttributesSelectionModal from '../../../../attributes/AttributesSelectionModal';
import EditAttribute from '../../../../attributes/EditAttribute';
import UnlinkLibAttribute from '../../../UnlinkLibAttribute';

interface IAttributesTabProps {
    library: GET_LIB_BY_ID_libraries_list | null;
    readonly: boolean;
}

const AttributesTab = ({library, readonly}: IAttributesTabProps): JSX.Element | null => {
    const {t} = useTranslation();
    const [showNewAttrModal, setShowNewAttrModal] = useState<boolean>(false);
    const [showAddExistingAttrModal, setShowAddExistingAttrModal] = useState<boolean>(false);
    const [saveLibAttr] = useMutation<SAVE_LIBRARY_ATTRIBUTES, SAVE_LIBRARY_ATTRIBUTESVariables>(
        saveLibAttributesMutation
    );

    const onRowClick = () => null;

    const _openNewAttrModal = () => {
        setShowNewAttrModal(true);
    };

    const _closeNewAttrModal = () => {
        setShowNewAttrModal(false);
    };

    const _openAddExistingAttrModal = () => {
        setShowAddExistingAttrModal(true);
    };

    const _closeAddExistingAttrModal = () => {
        setShowAddExistingAttrModal(false);
    };

    const saveAttributes = async (attributesToSave: string[]) => {
        return saveLibAttr({
            variables: {libId: library.id, attributes: attributesToSave},
            refetchQueries: [{query: getLibByIdQuery, variables: {id: library.id}}]
        });
    };

    const _onNewAttributeSaved = async (newAttr: GET_ATTRIBUTES_attributes_list) => {
        if (library === null) {
            return;
        }

        const attributesList = library.attributes ? [...library.attributes.map(a => a.id), newAttr.id] : [newAttr.id];

        await saveAttributes(attributesList);
        _closeNewAttrModal();
    };

    const _onClickUnlink = async (attributesList: string[]) => {
        return saveAttributes(attributesList);
    };

    const onExistingAttrAdded = async (selection: string[]) => {
        const newLibAttributes = library.attributes ? library.attributes.map(a => a.id) : [];
        newLibAttributes.push(...selection);

        await saveAttributes(newLibAttributes);
        _closeAddExistingAttrModal();
        return;
    };

    return (
        library && (
            <div>
                {!readonly && (
                    <Button icon labelPosition="left" size="medium" onClick={_openNewAttrModal}>
                        <Icon name="plus" />
                        {t('attributes.new')}
                    </Button>
                )}

                {!readonly && (
                    <Button icon labelPosition="left" size="medium" onClick={_openAddExistingAttrModal}>
                        <Icon name="plus" />
                        {t('libraries.link_existing_attribute')}
                    </Button>
                )}

                <AttributesList
                    loading={false}
                    attributes={library ? library.attributes : []}
                    onRowClick={onRowClick}
                    withFilters={false}
                    actions={
                        !readonly ? (
                            <UnlinkLibAttribute library={library} key="unlink_attr_btn" onUnlink={_onClickUnlink} />
                        ) : (
                            <></>
                        )
                    }
                />

                {!readonly && (
                    <Modal size="large" open={showNewAttrModal} onClose={_closeNewAttrModal} centered>
                        <Modal.Header>{t('attributes.new')}</Modal.Header>
                        <Modal.Content>
                            <EditAttribute attributeId={null} onPostSave={_onNewAttributeSaved} />
                        </Modal.Content>
                    </Modal>
                )}

                {library.attributes ? (
                    <AttributesSelectionModal
                        openModal={showAddExistingAttrModal}
                        onClose={_closeAddExistingAttrModal}
                        onSubmit={onExistingAttrAdded}
                        selection={library.attributes.map(a => a.id)}
                    />
                ) : (
                    <></>
                )}
            </div>
        )
    );
};

export default AttributesTab;
