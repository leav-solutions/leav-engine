// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import SelectRecordModal from 'components/records/SelectRecordModal';
import RecordCard from 'components/shared/RecordCard';
import useLang from 'hooks/useLang';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Confirm, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_LIBRARIES_libraries_list} from '_gqlTypes/GET_LIBRARIES';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';

interface IFileSelectorViewProps {
    onChange: (selectedFile: RecordIdentity_whoAmI) => void;
    value: RecordIdentity_whoAmI;
    label: string;
    disabled?: boolean;
    libraries: GET_LIBRARIES_libraries_list[];
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

function FileSelectorView({onChange, label, value, disabled, libraries}: IFileSelectorViewProps): JSX.Element {
    const {lang} = useLang();
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
                                <Button type="button" icon onClick={_openDeleteConfirm} aria-label="delete">
                                    <Icon name="close" />
                                </Button>
                            </Button.Group>
                        )}
                    </>
                )}
                {!value && (
                    <Button type="button" icon labelPosition="left" onClick={_openModal}>
                        <Icon name="search" />
                        {t('file_selector.select')}
                    </Button>
                )}
            </Wrapper>
            {isModalOpen && (
                <SelectRecordModal
                    library={libraries.map(l => l.id)}
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
                    content={t('file_selector.delete_confirm')}
                    confirmButton={t('admin.submit')}
                    cancelButton={t('admin.cancel')}
                />
            )}
        </>
    );
}

export default FileSelectorView;
