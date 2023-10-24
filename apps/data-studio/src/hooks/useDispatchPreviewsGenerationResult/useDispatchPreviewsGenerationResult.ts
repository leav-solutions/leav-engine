// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InfoChannel, InfoType} from '_types/types';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {addInfo} from 'reduxStore/infos';

type UseDispatchPreviewsGenerationResult = (isSuccess: boolean) => void;

export default function useDispatchPreviewsGenerationResult(): UseDispatchPreviewsGenerationResult {
    const {t} = useTranslation();
    const dispatch = useDispatch();

    const dispatchInfo = (isSuccess: boolean) => {
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
    };

    return dispatchInfo;
}
