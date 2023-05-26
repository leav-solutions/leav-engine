// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Button, Form, Space} from 'antd';
import {ReactNode, useState} from 'react';
import {TreeLightFragment} from '../../../../../../_gqlTypes';
import {PreviewSize} from '../../../../../../constants';
import {useLang} from '../../../../../../hooks';
import {useSharedTranslation} from '../../../../../../hooks/useSharedTranslation';
import {EntityCard, IEntityData} from '../../../../../EntityCard';
import {TreePicker} from '../../../../../TreePicker';

interface ILinkedTreeFormProps {
    onChange: (value: string) => Promise<void>;
    extra?: ReactNode;
    isReadOnly: boolean;
    selected?: string;
}

function LinkedTreeForm({onChange, isReadOnly, extra, selected}: ILinkedTreeFormProps): JSX.Element {
    const form = Form.useFormInstance();
    const linkedTree = Form.useWatch('linked_tree', form);
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const [isTreePickerOpen, setIsTreePickerOpen] = useState(false);

    const _handleOpenTreePicker = () => setIsTreePickerOpen(true);
    const _handleCloseTreePicker = () => setIsTreePickerOpen(false);

    const _handlePickTree = async (selectedTrees: TreeLightFragment[]) => {
        const selection = selectedTrees[0];
        form.setFieldsValue({linked_tree: selection});
        _handleCloseTreePicker();
        onChange(selection.id);
    };

    const treeIdentity: IEntityData | null = linkedTree
        ? {
              subLabel: linkedTree.id,
              label: localizedTranslation(linkedTree.label, lang),
              color: null,
              preview: null
          }
        : null;

    return (
        <Form.Item
            name="linked_tree"
            key="linked_tree"
            label={t('attributes.linked_tree')}
            validateTrigger={['onBlur', 'onChange', 'onSubmit']}
            hasFeedback
        >
            <Space>
                <Button disabled={isReadOnly} onClick={_handleOpenTreePicker} size={treeIdentity ? 'large' : 'middle'}>
                    {treeIdentity ? (
                        <EntityCard
                            entity={treeIdentity}
                            size={PreviewSize.tiny}
                            withSubLabel={false}
                            withColor={false}
                        />
                    ) : (
                        t('attributes.select_linked_tree')
                    )}
                </Button>
                {extra}
                {isTreePickerOpen && (
                    <TreePicker
                        open={isTreePickerOpen}
                        onClose={_handleCloseTreePicker}
                        onSubmit={_handlePickTree}
                        multiple={false}
                        selected={selected ? [selected] : []}
                        showSelected
                    />
                )}
            </Space>
        </Form.Item>
    );
}

export default LinkedTreeForm;
