// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {FaPlus} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {FeatureHook, IPrimaryAction} from '../_types';
import {LinkModal} from '../link-item/LinkModal';

/**
 * Hook used to get the action for `<DataView />` component.
 *
 * When items are linked, the view is refreshed
 *
 * It returns also two parts : one for the call action button - one for displaying the modal required by the action.
 *
 * @param isEnabled - whether the action is present
 * @param maxItemsLeft - the number of items that can be added
 * @param onLink - callback to let outside world know about linking feedback
 */
export const useLinkPrimaryAction = ({
    isEnabled,
    maxItemsLeft,
    onLink
}: FeatureHook<{
    maxItemsLeft: number | null;
    onLink?: (saveValuesResult: ISubmitMultipleResult) => void;
}>) => {
    const {t} = useSharedTranslation();

    const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);

    const disableAddItemAction = maxItemsLeft === 0;

    const _linkPrimaryAction: IPrimaryAction = {
        callback: () => {
            setIsLinkModalVisible(true);
        },
        icon: <FaPlus />,
        disabled: disableAddItemAction,
        label: t('explorer.add-existing-item')
    };

    return {
        linkPrimaryAction: isEnabled ? _linkPrimaryAction : null,
        linkModal: isLinkModalVisible ? (
            <LinkModal
                open
                onLink={onLink}
                onClose={() => {
                    setIsLinkModalVisible(false);
                }}
            />
        ) : null
    };
};
