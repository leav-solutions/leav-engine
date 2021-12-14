// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ArrowsAltOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import React, {useState} from 'react';
import {IRecordIdentityWhoAmI} from '_types/types';
import EditRecordModal from '../EditRecordModal';

interface IEditRecordBtnProps {
    record: IRecordIdentityWhoAmI;
    size: SizeType;
    shape?: 'circle' | 'round';
}

function EditRecordBtn({record, size, shape}: IEditRecordBtnProps): JSX.Element {
    const [isModalOpen, setIsModalOpen] = useState<boolean>();

    const _handleClick = () => {
        setIsModalOpen(true);
    };

    const _handleClose = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button
                aria-label="edit-record"
                shape={shape}
                icon={<ArrowsAltOutlined size={48} />}
                size={size}
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
