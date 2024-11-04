// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Confirm, Icon, Menu, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {ILinkValue} from '../../../../../_types/records';
import RecordCard from '../../../../shared/RecordCard';
import EditRecordModal from '../../../EditRecordModal';

interface ILinksFieldElementProps {
    value: ILinkValue;
    onDeleteLink: (value: ILinkValue) => void;
    readonly?: boolean;
}

const Row = styled(Table.Row)`
    position: relative;
    padding: 0;
`;

const HoverMenu = styled(Menu)`
    &&& {
        position: absolute;
        background: none;
        box-shadow: 0 0 40px 20px #444 inset;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: 0;
        border-radius: 0;
    }
`;

const LinksFieldElement = ({value, onDeleteLink, readonly = false}: ILinksFieldElementProps): JSX.Element => {
    const {t} = useTranslation();
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);

    const _handleMouseEnter = () => setIsHovering(true);
    const _handleMouseLeave = () => setIsHovering(false);

    const _openEditRecord = () => setShowModal(true);
    const _closeEditRecord = () => setShowModal(false);

    const _handleOpenDeleteConfirm = () => setOpenDeleteConfirm(true);
    const _handleCloseDeleteConfirm = () => setOpenDeleteConfirm(false);

    const _handleDelete = () => onDeleteLink(value);

    return (
        <>
            {value.linkValue && (
                <>
                    <Row
                        data-test-id="link_element_wrapper"
                        key={`${value.id_value}_${value.linkValue.whoAmI.id}`}
                        onMouseEnter={_handleMouseEnter}
                        onMouseLeave={_handleMouseLeave}
                        style={{position: 'relative'}}
                        className="my_row"
                    >
                        <Table.Cell style={{position: 'relative'}}>
                            <RecordCard record={value.linkValue.whoAmI} />
                            {isHovering && (
                                <HoverMenu data-test-id="link_element_hover_menu" size="small" inverted>
                                    <Menu.Item data-test-id="edit_record_btn" size="big" onClick={_openEditRecord}>
                                        <Icon name="edit outline" size="large" />
                                        {t('records.edit')}
                                    </Menu.Item>
                                    {!readonly && (
                                        <Menu.Item
                                            data-test-id="delete_link_btn"
                                            size="big"
                                            onClick={_handleOpenDeleteConfirm}
                                        >
                                            <Icon name="trash alternate" size="large" />
                                            {t('records.delete_link')}
                                        </Menu.Item>
                                    )}
                                </HoverMenu>
                            )}
                        </Table.Cell>
                    </Row>
                    <EditRecordModal
                        open={showModal}
                        onClose={_closeEditRecord}
                        recordId={value.linkValue.whoAmI.id}
                        library={value.linkValue.whoAmI.library.id}
                    />
                    {!readonly && (
                        <Confirm
                            data-test-id="delete_confirm_modal"
                            open={openDeleteConfirm}
                            onCancel={_handleCloseDeleteConfirm}
                            onConfirm={_handleDelete}
                            content={t('records.delete_confirm')}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default LinksFieldElement;
