// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Modal} from 'semantic-ui-react';
import useLang from '../../../../../hooks/useLang';
import {getLibByIdQuery} from '../../../../../queries/libraries/getLibraryById';
import {
    SaveLibAttributesMutation,
    saveLibAttributesMutation
} from '../../../../../queries/libraries/saveLibAttributesMutation';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {GET_LIB_BY_ID_libraries_list} from '../../../../../_gqlTypes/GET_LIB_BY_ID';
import AttributesList from '../../../../attributes/AttributesList';
import AttributesSelectionModal from '../../../../attributes/AttributesSelectionModal';
import EditAttribute from '../../../../attributes/EditAttribute';
import UnlinkLibAttribute from '../../../UnlinkLibAttribute';

interface IAttributesTabProps {
    library: GET_LIB_BY_ID_libraries_list | null;
    readOnly: boolean;
}

/* tslint:disable-next-line:variable-name */
const AttributesTab = ({library, readOnly}: IAttributesTabProps): JSX.Element | null => {
    const {t} = useTranslation();
    const [showNewAttrModal, setShowNewAttrModal] = useState<boolean>(false);
    const [showAddExistingAttrModal, setShowAddExistingAttrModal] = useState<boolean>(false);
    const onRowClick = () => null;
    const {lang} = useLang();

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

    return (
        library && (
            <SaveLibAttributesMutation mutation={saveLibAttributesMutation}>
                {saveLibAttr => {
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

                        const attributesList = library.attributes
                            ? [...library.attributes.map(a => a.id), newAttr.id]
                            : [newAttr.id];

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
                                {!readOnly && (
                                    <Button icon labelPosition="left" size="medium" onClick={_openNewAttrModal}>
                                        <Icon name="plus" />
                                        {t('attributes.new')}
                                    </Button>
                                )}

                                {!readOnly && (
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
                                        !readOnly ? (
                                            <UnlinkLibAttribute
                                                library={library}
                                                key="unlink_attr_btn"
                                                onUnlink={_onClickUnlink}
                                            />
                                        ) : (
                                            <></>
                                        )
                                    }
                                />

                                {!readOnly && (
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
                }}
            </SaveLibAttributesMutation>
        )
    );
};

export default AttributesTab;
