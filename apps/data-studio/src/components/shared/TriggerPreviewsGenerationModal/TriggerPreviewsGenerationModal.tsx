// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {Checkbox, Modal} from 'antd';
import {forcePreviewsGenerationMutation} from 'graphQL/mutations/files/forcePreviewsGenerationMutation';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {addInfo} from 'reduxStore/infos';
import {useAppDispatch} from 'reduxStore/store';
import {getRequestFromFilters} from 'utils/getRequestFromFilter';
import {FORCE_PREVIEWS_GENERATION, FORCE_PREVIEWS_GENERATIONVariables} from '_gqlTypes/FORCE_PREVIEWS_GENERATION';
import {IFilter, InfoChannel, InfoType} from '_types/types';

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

    const [isFailedOnlyChecked, setIsFailedOnlyChecked] = useState(false);
    const [startPreviewsGeneration, {loading, data}] = useMutation<
        FORCE_PREVIEWS_GENERATION,
        FORCE_PREVIEWS_GENERATIONVariables
    >(forcePreviewsGenerationMutation);
    const dispatch = useAppDispatch();

    const _triggerPreviewsGeneration = async () => {
        try {
            const result = await startPreviewsGeneration({
                variables: {
                    libraryId,
                    recordIds,
                    filters: filters ? getRequestFromFilters(filters) : null,
                    failedOnly: isFailedOnlyChecked
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

    return (
        <Modal
            open
            title={t('files.previews_generation_confirm')}
            cancelText={t('global.cancel')}
            okText={t('global.submit')}
            onCancel={onClose}
            width={600}
            onOk={_triggerPreviewsGeneration}
            confirmLoading={loading}
        >
            <Checkbox onChange={_handleFailedOnlyChange} checked={isFailedOnlyChecked}>
                {t('files.previews_generation_failed_only')}
            </Checkbox>
        </Modal>
    );
}

export default TriggerPreviewsGenerationModal;
