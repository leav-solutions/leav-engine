// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal} from 'antd';
import {useState} from 'react';
import {useSharedTranslation} from '../../hooks/useSharedTranslation';
import {AttributesList} from './AttributesList';

interface IAttributePickerProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (selectedAttributes: string[]) => Promise<void>;
    canCreate?: boolean;
    selected?: string[];
    multiple?: boolean;
}

function AttributePicker({
    open,
    onClose,
    onSubmit,
    selected = [],
    canCreate = true,
    multiple = true
}: IAttributePickerProps): JSX.Element {
    const {t} = useSharedTranslation();
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const _handleSelect = (selection: string[]) => {
        setSelectedAttributes(selection);
    };

    const _handleSubmit = async () => {
        setIsLoading(true);
        await onSubmit(selectedAttributes);
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={800}
            title={t('attributes.select_attributes')}
            onOk={_handleSubmit}
            destroyOnClose
            okText={t('global.submit')}
            cancelText={t('global.cancel')}
            confirmLoading={isLoading}
            centered
        >
            <AttributesList onSelect={_handleSelect} selected={selected} multiple={multiple} />
        </Modal>
    );
}

export default AttributePicker;
