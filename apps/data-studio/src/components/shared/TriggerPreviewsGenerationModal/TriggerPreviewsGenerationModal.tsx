// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import {ErrorDisplay, Loading, useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {Checkbox, Divider, Modal, Tree} from 'antd';
import {forcePreviewsGenerationMutation} from 'graphQL/mutations/files/forcePreviewsGenerationMutation';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {addInfo} from 'reduxStore/infos';
import {useAppDispatch} from 'reduxStore/store';
import {getRequestFromFilters} from 'utils/getRequestFromFilter';
import {FORCE_PREVIEWS_GENERATION, FORCE_PREVIEWS_GENERATIONVariables} from '_gqlTypes/FORCE_PREVIEWS_GENERATION';
import {GET_LIBRARIES_LIST, GET_LIBRARIES_LISTVariables} from '_gqlTypes/GET_LIBRARIES_LIST';
import {IFilter, InfoChannel, InfoType} from '_types/types';

interface ITriggerPreviewsGenerationModalProps {
    libraryId: string;
    filesLibraryId?: string;
    recordIds?: string[];
    filters?: IFilter[];
    onClose: () => void;
}

function TriggerPreviewsGenerationModal({
    libraryId,
    filesLibraryId,
    recordIds,
    filters,
    onClose
}: ITriggerPreviewsGenerationModalProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();

    const [isFailedOnlyChecked, setIsFailedOnlyChecked] = useState(false);
    const [checkedSizes, setCheckedSizes] = useState<string[]>([]);
    const [treeData, setTreeData] = useState([]);
    const [allSizes, setAllSizes] = useState<string[]>([]);

    const [startPreviewsGeneration, {loading, data}] = useMutation<
        FORCE_PREVIEWS_GENERATION,
        FORCE_PREVIEWS_GENERATIONVariables
    >(forcePreviewsGenerationMutation);
    const dispatch = useAppDispatch();

    const {error: getLibrariesError, loading: getLibrariesLoading} = useQuery<
        GET_LIBRARIES_LIST,
        GET_LIBRARIES_LISTVariables
    >(getLibrariesListQuery, {
        variables: {
            filters: {
                id: [filesLibraryId || libraryId]
            }
        },
        onCompleted: getLibrariesData => {
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
        }
    });

    const _triggerPreviewsGeneration = async () => {
        try {
            const result = await startPreviewsGeneration({
                variables: {
                    libraryId,
                    recordIds,
                    filters: filters ? getRequestFromFilters(filters) : null,
                    failedOnly: isFailedOnlyChecked,
                    previewVersionSizeNames: checkedSizes
                }
            });

            const isSuccess = result.data?.forcePreviewsGeneration ?? false;

            const message = isSuccess
                ? t('files.previews_generation_success')
                : t('files.previews_generation_nothing_to_do');

            dispatch(
                addInfo({
                    type: InfoType.success,
                    channel: InfoChannel.passive,
                    content: message
                })
            );

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

export default TriggerPreviewsGenerationModal;
