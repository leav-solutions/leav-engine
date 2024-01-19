// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal} from 'antd';
import {useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {TreeLightFragment} from '_ui/_gqlTypes';
import {TreesList} from './TreesList';

interface ITreePickerProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (selectedTrees: TreeLightFragment[]) => Promise<void>;
    selected?: string[];
    multiple?: boolean;
    showSelected?: boolean;
}

function TreePicker({
    open,
    onClose,
    onSubmit,
    selected = [],
    multiple = true,
    showSelected = false
}: ITreePickerProps): JSX.Element {
    const {t} = useSharedTranslation();
    const [selectedTrees, setSelectedTrees] = useState<TreeLightFragment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const _handleSelect = (selection: TreeLightFragment[]) => {
        setSelectedTrees(selection);
    };

    const _handleSubmit = async () => {
        setIsLoading(true);
        await onSubmit(selectedTrees);
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={800}
            title={t('trees.select_trees')}
            onOk={_handleSubmit}
            destroyOnClose
            okText={t('global.submit')}
            cancelText={t('global.cancel')}
            confirmLoading={isLoading}
            centered
        >
            <TreesList onSelect={_handleSelect} selected={selected} multiple={multiple} showSelected={showSelected} />
        </Modal>
    );
}

export default TreePicker;
