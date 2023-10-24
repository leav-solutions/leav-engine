// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useLang from '../../hooks/useLang';
import {ErrorDisplay} from '../ErrorDisplay';
import {Loading} from '../Loading';
import {localizedTranslation} from '@leav/utils';
import {Checkbox, Divider, Modal, Tree} from 'antd';
import {
    useForcePreviewsGenerationMutation,
    useGetLibrariesListQuery,
    ForcePreviewsGenerationMutationVariables
} from '../../_gqlTypes';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

interface IPreviewsGenerationModalProps {
    libraryId: string;
    filesLibraryId?: string;
    recordIds?: string[];
    filters?: ForcePreviewsGenerationMutationVariables['filters'];
    onClose: () => void;
    onResult: (isSuccess: boolean) => void; // FIXME: data type IInfo
}

function PreviewsGenerationModal({
    libraryId,
    filesLibraryId,
    recordIds,
    filters,
    onClose,
    onResult
}: IPreviewsGenerationModalProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();

    const [isFailedOnlyChecked, setIsFailedOnlyChecked] = useState(false);
    const [checkedSizes, setCheckedSizes] = useState<string[]>([]);
    const [treeData, setTreeData] = useState([]);
    const [allSizes, setAllSizes] = useState<string[]>([]);

    const [startPreviewsGeneration, {loading}] = useForcePreviewsGenerationMutation();

    const {data: getLibrariesData, error: getLibrariesError, loading: getLibrariesLoading} = useGetLibrariesListQuery({
        variables: {
            filters: {
                id: [filesLibraryId || libraryId]
            }
        }
    });

    useEffect(() => {
        const previewSettings = getLibrariesData.libraries.list?.[0].previewsSettings || [];
        const sizes = [];

        const td = previewSettings.map(s => {
            const children = s.versions.sizes.map(vs => ({title: `${vs.name} (${vs.size}px)`, key: vs.name}));
            sizes.push(...children.map(c => c.key));

            return {
                title: localizedTranslation(s.label, lang),
                key: localizedTranslation(s.label, lang),
                children
            };
        });

        setTreeData(td);
        setAllSizes(sizes);
    }, [getLibrariesData]);

    const _triggerPreviewsGeneration = async () => {
        try {
            const result = await startPreviewsGeneration({
                variables: {
                    libraryId,
                    recordIds,
                    filters,
                    failedOnly: isFailedOnlyChecked,
                    previewVersionSizeNames: checkedSizes
                }
            });

            const isSuccess = !!result.data?.forcePreviewsGeneration;

            onResult(isSuccess);

            onClose();
        } catch (e) {
            // Nothing to do here, error is handled globally by Apollo. Uncomment next line for easier tests debug
            console.error(e);
        }
    };

    const _handleFailedOnlyChange = () => {
        setIsFailedOnlyChecked(!isFailedOnlyChecked);
    };

    const onCheck = (_, {checkedNodes}) => {
        const checked = checkedNodes.filter(n => !n.children).map(n => n.key) as string[]; // we keep only sizes name

        setCheckedSizes(checked);
    };

    const onChange = () => {
        if (checkedSizes.length === allSizes.length) {
            setCheckedSizes([]);
        } else {
            setCheckedSizes(allSizes);
        }
    };

    return (
        <Modal
            open
            title={t('files.generate_previews')}
            cancelText={t('global.cancel')}
            okText={t('global.submit')}
            onCancel={onClose}
            width={600}
            onOk={_triggerPreviewsGeneration}
            okButtonProps={{
                disabled: !checkedSizes.length
            }}
            confirmLoading={loading}
        >
            {getLibrariesLoading && <Loading />}
            {!getLibrariesLoading && getLibrariesError && <ErrorDisplay message={getLibrariesError.message} />}
            {!getLibrariesLoading && !getLibrariesError && (
                <>
                    <Checkbox onChange={onChange} checked={checkedSizes.length === allSizes.length}>
                        {t('files.previews_generation_select_all')}
                    </Checkbox>
                    <Tree
                        checkable
                        onCheck={onCheck}
                        checkedKeys={checkedSizes}
                        selectable={false}
                        treeData={treeData}
                    />
                    <Divider />
                    <Checkbox onChange={_handleFailedOnlyChange} checked={isFailedOnlyChecked} aria-label="failed-only">
                        {t('files.previews_generation_failed_only')}
                    </Checkbox>
                </>
            )}
        </Modal>
    );
}

export default PreviewsGenerationModal;
