// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {FaPlus} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {Entrypoint, FeatureHook, IEntrypointLink, IPrimaryAction} from '../_types';
import {LinkModal} from '../link-item/LinkModal';
import {JoinLibraryContextFragment, useExplorerLinkAttributeQuery} from '_ui/_gqlTypes';

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
    entrypoint,
    linkId,
    canAddLinkValue,
    joinLibraryContext,
    onLink
}: FeatureHook<{
    entrypoint: Entrypoint;
    linkId?: string;
    maxItemsLeft: number | null;
    canAddLinkValue: boolean;
    joinLibraryContext?: JoinLibraryContextFragment;
    onLink?: (saveValuesResult: ISubmitMultipleResult) => void;
}>) => {
    const {t} = useSharedTranslation();

    const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
    const [multipleValues, setIsMultivalues] = useState(false);

    const disableAddItemAction = maxItemsLeft === 0 || !canAddLinkValue;

    useExplorerLinkAttributeQuery({
        skip: entrypoint.type !== 'link',
        variables: {
            id: joinLibraryContext?.mandatoryAttribute || (entrypoint as IEntrypointLink).linkAttributeId
        },
        onCompleted: data => {
            const attributeData = data?.attributes?.list?.[0];
            if (!attributeData) {
                throw new Error('Unknown link attribute');
            }
            setIsMultivalues(
                joinLibraryContext?.mandatoryAttribute
                    ? joinLibraryContext.multipleValues || false
                    : attributeData.multiple_values
            );
        }
    });

    const replacementMode = linkId && !multipleValues;

    const _linkPrimaryAction: IPrimaryAction = {
        callback: () => {
            setIsLinkModalVisible(true);
        },
        icon: <FaPlus />,
        disabled: disableAddItemAction,
        label: replacementMode ? t('record_edition.replace-by-existing-item') : t('explorer.add-existing-item')
    };

    return {
        linkPrimaryAction: isEnabled ? _linkPrimaryAction : null,
        linkModal: isLinkModalVisible ? (
            <LinkModal
                open
                onLink={onLink}
                joinLibraryContext={joinLibraryContext}
                linkId={replacementMode ? linkId : undefined}
                onClose={() => {
                    setIsLinkModalVisible(false);
                }}
            />
        ) : null
    };
};
