// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ArrowsAltOutlined} from '@ant-design/icons';
import {Button, ButtonProps} from 'antd';
import {SyntheticEvent, useState} from 'react';
import {IRecordIdentityWhoAmI} from '_ui/types/records';
import {IValueVersion} from '_ui/types/values';
import {EditRecordModal} from '../EditRecordModal';

interface IEditRecordBtnProps extends ButtonProps {
    record: IRecordIdentityWhoAmI;
    valuesVersion?: IValueVersion;
}

function EditRecordBtn({record, valuesVersion, ...buttonProps}: IEditRecordBtnProps): JSX.Element {
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
                    valuesVersion={valuesVersion}
                />
            )}
        </>
    );
}

export default EditRecordBtn;
