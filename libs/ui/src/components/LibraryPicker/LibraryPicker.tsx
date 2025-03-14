// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal} from 'antd';
import {useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {LibraryLightFragment} from '_ui/_gqlTypes';
import {LibrariesList} from './LibrariesList';

interface ILibraryPickerProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (selectedLibraries: LibraryLightFragment[]) => void;
    selected?: string[];
    multiple?: boolean;
    showSelected?: boolean;
}

function LibraryPicker({
    open,
    onClose,
    onSubmit,
    selected = [],
    multiple = true,
    showSelected = false
}: ILibraryPickerProps): JSX.Element {
    const {t} = useSharedTranslation();

    const [selectedLibraries, setSelectedLibraries] = useState<LibraryLightFragment[]>([]);

    const _handleSelect = (selection: LibraryLightFragment[]) => {
        setSelectedLibraries(selection);
    };

    const _handleSubmit = () => {
        onSubmit(selectedLibraries);
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={800}
            title={t('libraries.select_libraries')}
            onOk={_handleSubmit}
            destroyOnClose
            okText={t('global.submit')}
            cancelText={t('global.cancel')}
            centered
        >
            <LibrariesList
                onSelect={_handleSelect}
                selected={selected}
                multiple={multiple}
                showSelected={showSelected}
            />
        </Modal>
    );
}

export default LibraryPicker;
