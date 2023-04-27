// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal} from 'antd';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {LibrariesList} from './LibrariesList';

interface ILibraryPickerProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (selectedLibraries: string[]) => void;
    canCreate?: boolean;
    selected?: string[];
    multiple?: boolean;
}

function LibraryPicker({
    open,
    onClose,
    onSubmit,
    selected = [],
    canCreate = true,
    multiple = true
}: ILibraryPickerProps): JSX.Element {
    const {t} = useTranslation('shared');
    const [selectedLibraries, setSelectedLibraries] = useState<string[]>([]);

    const _handleSelect = (selection: string[]) => {
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
            style={{height: '95vh'}}
            onOk={_handleSubmit}
            destroyOnClose
            okText={t('global.submit')}
            cancelText={t('global.cancel')}
        >
            <LibrariesList onSelect={_handleSelect} selected={selected} multiple={multiple} canCreate={canCreate} />
        </Modal>
    );
}

export default LibraryPicker;
