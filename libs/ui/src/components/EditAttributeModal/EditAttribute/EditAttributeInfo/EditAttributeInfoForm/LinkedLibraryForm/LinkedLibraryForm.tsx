// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Button, Form, Space} from 'antd';
import {ReactNode, useState} from 'react';
import {LibraryLightFragment} from '../../../../../../_gqlTypes';
import {PreviewSize} from '../../../../../../constants';
import {useLang} from '../../../../../../hooks';
import {useSharedTranslation} from '../../../../../../hooks/useSharedTranslation';
import {EntityCard, IEntityData} from '../../../../../EntityCard';
import {LibraryPicker} from '../../../../../LibraryPicker';

interface ILinkedLibraryFormProps {
    onChange: (value: string) => void;
    extra?: ReactNode;
    isReadOnly: boolean;
    selected?: string;
}

function LinkedLibraryForm({onChange, isReadOnly, extra, selected}: ILinkedLibraryFormProps): JSX.Element {
    const form = Form.useFormInstance();
    const linkedLibrary = Form.useWatch('linked_library', form);
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);

    const _handleOpenLibraryPicker = () => setIsLibraryPickerOpen(true);
    const _handleCloseLibraryPicker = () => setIsLibraryPickerOpen(false);

    const _handlePickLibrary = (selectedLibraries: LibraryLightFragment[]) => {
        const selection = selectedLibraries[0];
        form.setFieldsValue({linked_library: selection});
        _handleCloseLibraryPicker();
        onChange(selection.id);
    };

    const libraryIdentity: IEntityData = linkedLibrary
        ? {
              subLabel: linkedLibrary.id,
              label: localizedTranslation(linkedLibrary.label, lang),
              color: null,
              preview: null
          }
        : null;

    return (
        <Form.Item
            name="linked_library"
            key="linked_library"
            label={t('attributes.linked_library')}
            validateTrigger={['onBlur', 'onChange', 'onSubmit']}
            hasFeedback
        >
            <Space>
                <Button
                    disabled={isReadOnly}
                    onClick={_handleOpenLibraryPicker}
                    size={libraryIdentity ? 'large' : 'middle'}
                >
                    {libraryIdentity ? (
                        <EntityCard
                            entity={libraryIdentity}
                            size={PreviewSize.tiny}
                            withSubLabel={false}
                            withColor={false}
                        />
                    ) : (
                        t('attributes.select_linked_library')
                    )}
                </Button>
                {extra}
                {isLibraryPickerOpen && (
                    <LibraryPicker
                        open={isLibraryPickerOpen}
                        onClose={_handleCloseLibraryPicker}
                        onSubmit={_handlePickLibrary}
                        multiple={false}
                        selected={selected ? [selected] : []}
                        showSelected
                    />
                )}
            </Space>
        </Form.Item>
    );
}

export default LinkedLibraryForm;
