import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Confirm, Dropdown, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import {RecordIdentity_whoAmI} from '../../../../../../../../_gqlTypes/RecordIdentity';
import RecordCard from '../../../../../../../shared/RecordCard';
import EditRecordModal from '../../../../../../EditRecordModal';

interface IPathPartProps {
    record: RecordIdentity_whoAmI;
    deletable?: boolean;
    onDelete?: (record: RecordIdentity_whoAmI) => void;
}

/* tslint:disable-next-line:variable-name */
const PathPartWrapper = styled.div`
    position: relative;
    padding-right: 60px;
    height: 30px;
`;

/* tslint:disable-next-line:variable-name */
const HoverDropdown = styled(Dropdown)`
    && {
        position: absolute;
        top: 7px;
        right: 0;
    }
`;

/* tslint:disable-next-line:variable-name */
const PathPart = ({record, deletable = false, onDelete}: IPathPartProps): JSX.Element => {
    const {t} = useTranslation();
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
    const [showEditRecordModal, setShowEditRecordModal] = useState<boolean>(false);

    const _handleDelete = () => !!onDelete && onDelete(record);

    const _handleMouseEnter = () => setIsHovering(true);
    const _handleMouseLeave = () => setIsHovering(false);

    const _handleOpenEditRecordModal = () => setShowEditRecordModal(true);
    const _handleCloseEditRecordModal = () => setShowEditRecordModal(false);

    const _handleOpenDeleteConfirm = () => setOpenDeleteConfirm(true);
    const _handleCloseDeleteConfirm = () => setOpenDeleteConfirm(false);

    const showMenuBtn = <Icon name="ellipsis vertical" />;
    const dropdownItems = [
        <Dropdown.Item
            key="edit_linked_record"
            data-test-id="edit_tree_link_btn"
            onClick={_handleOpenEditRecordModal}
            icon="edit outline"
            text={t('records.edit')}
        />
    ];

    if (deletable && onDelete) {
        dropdownItems.push(
            <Dropdown.Item
                key="delete_link"
                data-test-id="delete_tree_link_btn"
                onClick={_handleOpenDeleteConfirm}
                icon="trash alternate outline"
                text={t('records.delete_link')}
            />
        );
    }

    return (
        <>
            <PathPartWrapper
                data-test-id="path_part_wrapper"
                onMouseEnter={_handleMouseEnter}
                onMouseLeave={_handleMouseLeave}
            >
                <RecordCard record={record} />
                {isHovering && (
                    <HoverDropdown trigger={showMenuBtn} icon={false}>
                        <Dropdown.Menu>{dropdownItems.map(i => i)}</Dropdown.Menu>
                    </HoverDropdown>
                )}
            </PathPartWrapper>
            {showEditRecordModal && (
                <EditRecordModal
                    recordId={record.id}
                    library={record.library.id}
                    open={showEditRecordModal}
                    onPostSave={_handleCloseEditRecordModal}
                    onClose={_handleCloseEditRecordModal}
                />
            )}
            {deletable && onDelete && (
                <Confirm
                    data-test-id="delete_confirm_modal"
                    open={openDeleteConfirm}
                    onCancel={_handleCloseDeleteConfirm}
                    onConfirm={_handleDelete}
                    content={t('records.delete_confirm')}
                />
            )}
        </>
    );
};

export default PathPart;
