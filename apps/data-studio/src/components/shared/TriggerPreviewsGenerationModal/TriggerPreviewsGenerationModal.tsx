// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import {Checkbox, Divider, Modal, Tree} from 'antd';
import {forcePreviewsGenerationMutation} from 'graphQL/mutations/files/forcePreviewsGenerationMutation';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {addInfo} from 'reduxStore/infos';
import {localizedTranslation} from '@leav/utils';
import {useAppDispatch} from 'reduxStore/store';
import {getRequestFromFilters} from 'utils/getRequestFromFilter';
import {FORCE_PREVIEWS_GENERATION, FORCE_PREVIEWS_GENERATIONVariables} from '_gqlTypes/FORCE_PREVIEWS_GENERATION';
import {IFilter, InfoChannel, InfoType} from '_types/types';
import {GET_LIBRARIES_LIST, GET_LIBRARIES_LISTVariables} from '_gqlTypes/GET_LIBRARIES_LIST';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {useLang} from '@leav/ui';

interface ITriggerPreviewsGenerationModalProps {
    libraryId: string;
    recordIds?: string[];
    filters?: IFilter[];
    onClose: () => void;
}

function TriggerPreviewsGenerationModal({
    libraryId,
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

    const getAllSizes = tree => {
        const sizes = [];

        for (const e of tree) {
            let childKeys = [];

            if (e.children?.length) {
                childKeys = getAllSizes(e.children);
            } else {
                sizes.push(e.key);
            }

            sizes.push(...childKeys);
        }

        return sizes;
    };

    useQuery<GET_LIBRARIES_LIST, GET_LIBRARIES_LISTVariables>(getLibrariesListQuery, {
        variables: {
            filters: {
                id: [libraryId]
            }
        },
        onCompleted: getLibrariesData => {
            const previewSettings = getLibrariesData.libraries.list?.[0].previewsSettings || [];

            const td = previewSettings.map(s => ({
                title: localizedTranslation(s.label, lang),
                key: localizedTranslation(s.label, lang),
                children: s.versions.sizes.map(vs => ({title: `${vs.name} (${vs.size}px)`, key: vs.name}))
            }));

            setTreeData(td);
            setAllSizes(getAllSizes(td));
        },
        onError: console.error
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
            // Nothing to do here, error is handled globally by Apollo
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
            <Checkbox onChange={onChange} checked={checkedSizes.length === allSizes.length}>
                Select All
            </Checkbox>
            <Tree checkable onCheck={onCheck} checkedKeys={checkedSizes} selectable={false} treeData={treeData} />
            <Divider />
            <Checkbox onChange={_handleFailedOnlyChange} checked={isFailedOnlyChecked}>
                {t('files.previews_generation_failed_only')}
            </Checkbox>
        </Modal>
    );
}

export default TriggerPreviewsGenerationModal;
