// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ArrowsAltOutlined} from '@ant-design/icons';
import {Button, ButtonProps} from 'antd';
import React, {SyntheticEvent, useState} from 'react';
import {IRecordIdentityWhoAmI} from '_types/types';
import EditRecordModal from '../EditRecordModal';

interface IEditRecordBtnProps extends ButtonProps {
    record: IRecordIdentityWhoAmI;
}

function EditRecordBtn({record, ...buttonProps}: IEditRecordBtnProps): JSX.Element {
    const [isModalOpen, setIsModalOpen] = useState<boolean>();

    const _handleClick = (e: SyntheticEvent) => {
        e.stopPropagation();
        e.preventDefault();

        setIsModalOpen(true);
    };

    const _handleClose = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button
                aria-label="edit-record"
                shape="circle"
                {...buttonProps}
                icon={<ArrowsAltOutlined size={48} />}
                onClick={_handleClick}
            />
            {isModalOpen && (
                <EditRecordModal
                    open={isModalOpen}
                    record={record}
                    library={record.library.id}
                    onClose={_handleClose}
                />
            )}
        </>
    );
}

export default EditRecordBtn;
