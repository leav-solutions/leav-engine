import {ArrowsAltOutlined} from '@ant-design/icons';
import {Button, type ButtonProps} from 'antd';
import {type SyntheticEvent, useState} from 'react';
import {type IRecordIdentityWhoAmI} from '_ui/types/records';
import {type IValueVersion} from '_ui/types/values';
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
