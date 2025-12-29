// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMemo, useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type FeatureHook, type IItemAction} from '../_types';
import {LinkModal} from '../link-item/LinkModal';
import {type ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExchangeAlt} from '@fortawesome/free-solid-svg-icons';

/**
 * Hook used to get the action for `<DataView />` component.
 *
 * When the mutation for replaceing is done, the Apollo cache will be refreshed (`Record` and `RecordIdentity`)
 * from only replaceed record.
 *
 * It returns also two parts : one for the action button call - one for displaying the modal required by the action.
 *
 * @param isEnabled - whether the action is present
 * @param onReplace - callback to let outside world know about replacing feedback
 * @param canReplaceLinkValues - check permission to delete link values
 */
export const useReplaceItemAction = ({
    isEnabled,
    onReplace,
    isMultivalue,
    canReplaceLinkValues,
}: FeatureHook<{
    isMultivalue: boolean;
    onReplace?: (replaceValuesResult: ISubmitMultipleResult) => void;
    canReplaceLinkValues: boolean;
}>) => {
    const {t} = useSharedTranslation();
    const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
    const [linkIdSelected, setLinkIdSelected] = useState<string | undefined>();

    const _replaceItemAction: IItemAction = useMemo(
        () => ({
            label: t('explorer.replace-item')!,
            icon: <FontAwesomeIcon icon={faExchangeAlt} />,
            disabled: !canReplaceLinkValues,
            callback: item => {
                setLinkIdSelected(item.id_value);
                setIsReplaceModalOpen(!isReplaceModalOpen);
            },
        }),
        [canReplaceLinkValues],
    );

    const replaceAction = useMemo(
        () => ({
            replaceItemAction: isEnabled ? _replaceItemAction : null,
            replaceItemModal:
                isEnabled && isReplaceModalOpen ? (
                    <LinkModal
                        open
                        linkId={linkIdSelected}
                        isMultivalue={isMultivalue}
                        onReplace={onReplace}
                        onClose={() => {
                            setIsReplaceModalOpen(false);
                        }}
                    />
                ) : null,
        }),
        [isEnabled, isReplaceModalOpen, _replaceItemAction],
    );

    return replaceAction;
};
