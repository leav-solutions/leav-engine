// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import SelectRecordModal from 'components/records/SelectRecordModal';
import RecordCard from 'components/shared/RecordCard';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Confirm, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';

interface IRecordSelectorProps {
    onChange: (selectedFile: RecordIdentity_whoAmI) => void;
    value: RecordIdentity_whoAmI;
    label: string;
    disabled?: boolean;
    libraries: string[];
    required?: boolean;
}

const Wrapper = styled.div`
    display: flex;
    height: 3rem;

    && .buttons {
        display: none;
    }

    &:hover .buttons {
        display: block;
    }

    > * {
        margin-right: 1em;
    }
`;

function RecordSelector({
    onChange,
    label,
    value,
    disabled,
    libraries,
    required = false
}: IRecordSelectorProps): JSX.Element {
    const {t} = useTranslation();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const _openDeleteConfirm = () => setShowDeleteConfirm(true);
    const _closeDeleteConfirm = () => setShowDeleteConfirm(false);

    const _openModal = () => {
        setIsModalOpen(true);
    };
    const _handleCloseModal = () => setIsModalOpen(false);
    const _handleSelect = (record: RecordIdentity_whoAmI) => {
        onChange(record);
        setIsModalOpen(false);
    };
    const _handleDelete = () => {
        onChange(null);
        _closeDeleteConfirm();
    };

    return (
        <>
            <label>{label}</label>
            <Wrapper>
                {value && (
                    <>
                        <RecordCard record={value} />
                        {!disabled && (
                            <Button.Group basic>
                                <Button
                                    type="button"
                                    icon
                                    onClick={_openModal}
                                    title="exchange"
                                    aria-label="exchange"
                                    name="exchange"
                                >
                                    <Icon name="exchange" />
                                </Button>
                                {!required && (
                                    <Button type="button" icon onClick={_openDeleteConfirm} aria-label="delete">
                                        <Icon name="close" />
                                    </Button>
                                )}
                            </Button.Group>
                        )}
                    </>
                )}
                {!value && (
                    <Button type="button" icon labelPosition="left" onClick={_openModal}>
                        <Icon name="search" />
                        {t('record_selector.select')}
                    </Button>
                )}
            </Wrapper>
            {isModalOpen && (
                <SelectRecordModal
                    library={libraries}
                    open={isModalOpen}
                    onClose={_handleCloseModal}
                    onSelect={_handleSelect}
                />
            )}
            {showDeleteConfirm && (
                <Confirm
                    open={showDeleteConfirm}
                    onCancel={_closeDeleteConfirm}
                    onConfirm={_handleDelete}
                    content={t('record_selector.delete_confirm')}
                    confirmButton={t('admin.submit')}
                    cancelButton={t('admin.cancel')}
                />
            )}
        </>
    );
}

export default RecordSelector;
