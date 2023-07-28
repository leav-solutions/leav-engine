// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    GetLibraryByIdQuery,
    useSaveLibraryMutation,
    useCancelTaskMutation,
    useIndexRecordsMutation
} from '../../../../_gqlTypes';
import {Divider, SelectProps} from 'antd';
// eslint-disable-next-line no-duplicate-imports
import {Select, Button, Alert, Space} from 'antd';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '../../../../hooks';
import {useEffect, useState} from 'react';
import {useSharedTranslation} from '../../../../hooks/useSharedTranslation';

interface IEditLibraryAttributesProps {
    library: GetLibraryByIdQuery['libraries']['list'][number];
    indexationTask?: string;
    readOnly?: boolean;
}

function EditLibraryIndexation({library, indexationTask, readOnly}: IEditLibraryAttributesProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const [saveLibrary] = useSaveLibraryMutation();
    const [indexRecords] = useIndexRecordsMutation();
    const [cancelTaskMutation] = useCancelTaskMutation();
    const [fullTextAttributes, setFullTextAttributes] = useState<string[]>(library.fullTextAttributes.map(e => e.id));
    const [isEdited, setIsEdited] = useState<boolean>(false);
    const isReadOnly = readOnly || !(library.permissions?.admin_library ?? true);

    const options: SelectProps['options'] = library.attributes.map(a => ({
        label: localizedTranslation(a.label, lang),
        value: a.id
    }));

    const _onChange = (value: string[]) => {
        setFullTextAttributes(value);
    };

    const _onSubmit = async () => {
        await saveLibrary({
            variables: {
                library: {
                    id: library.id,
                    fullTextAttributes
                }
            }
        });
    };

    const _onRefresh = async () => {
        await indexRecords({
            variables: {
                libraryId: library.id
            }
        });
    };

    const _onCancel = async () => {
        await cancelTaskMutation({
            variables: {
                taskId: indexationTask
            }
        });
    };

    useEffect(() => {
        const intersections = library.fullTextAttributes.filter(value => fullTextAttributes.includes(value.id));

        setIsEdited(
            intersections.length !== library.fullTextAttributes.length ||
                intersections.length !== fullTextAttributes.length
        );
    }, [library.fullTextAttributes, fullTextAttributes]);

    return (
        <Space style={{display: 'flex'}} direction="vertical">
            {!!indexationTask ? (
                <Alert
                    message={t('libraries.indexation_in_progress')}
                    type="warning"
                    showIcon
                    action={
                        <Button disabled={isReadOnly} size="small" danger onClick={_onCancel}>
                            {t('global.cancel')}
                        </Button>
                    }
                />
            ) : (
                <>
                    <Button block type="primary" onClick={_onRefresh} disabled={isReadOnly}>
                        {t('libraries.sync_indexation')}
                    </Button>
                    <Divider orientation="left">{t('libraries.indexed_attributes')}</Divider>
                    <Select
                        disabled={isReadOnly}
                        mode="multiple"
                        allowClear
                        style={{width: '100%'}}
                        placeholder={t('attributes.select_indexed_attributes')}
                        defaultValue={library.fullTextAttributes.map(a => a.id)}
                        onChange={_onChange}
                        options={options}
                    />
                    <Button
                        style={{float: 'right'}}
                        type="primary"
                        onClick={_onSubmit}
                        disabled={!isEdited || isReadOnly}
                    >
                        {t('global.submit')}
                    </Button>
                </>
            )}
        </Space>
    );
}

export default EditLibraryIndexation;
