// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {JoinLibraryContextFragment, useExplorerLinkAttributeQuery} from '_ui/_gqlTypes';
import {ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {SelectRecordForLinkModal} from '_ui/components/SelectRecordForLinkModal';
import {IEntrypointLink} from '../_types';
import {useAddLinkMassAction} from './useAddLinkMassAction';
import {useViewSettingsContext} from '../manage-view-settings/store-view-settings/useViewSettingsContext';
import {useReplaceLinkMassAction} from './useReplaceLinkMassAction';
import {LINK_RECORDS_MODAL_CLASSNAME} from '../_constants';

interface ILinkModalProps {
    open: boolean;
    linkId?: string;
    joinLibraryContext?: JoinLibraryContextFragment;
    onClose: () => void;
    onLink?: (saveValuesResult: ISubmitMultipleResult) => void;
    onReplace?: (replaceValuesResult: ISubmitMultipleResult) => void;
}

export const LinkModal: FunctionComponent<ILinkModalProps> = ({
    open,
    linkId,
    joinLibraryContext,
    onLink,
    onReplace,
    onClose
}) => {
    const {view} = useViewSettingsContext();

    const {data: attributeData} = useExplorerLinkAttributeQuery({
        skip: view.entrypoint.type !== 'link',
        variables: {
            id: joinLibraryContext?.linkedLibrary || (view.entrypoint as IEntrypointLink).linkAttributeId
        }
    });

    const isMultiple = joinLibraryContext?.mandatoryAttribute
        ? joinLibraryContext.multipleValues
        : attributeData?.attributes?.list?.[0]?.multiple_values;
    const isReplacement = !!linkId;

    const {createLinks} = useAddLinkMassAction({
        store: {view},
        linkAttributeId: (view.entrypoint as IEntrypointLink).linkAttributeId,
        onLink,
        closeModal: onClose
    });

    const {replaceLink} = useReplaceLinkMassAction({
        store: {view},
        linkAttributeId: (view.entrypoint as IEntrypointLink).linkAttributeId,
        linkId,
        onReplace,
        closeModal: onClose
    });

    return (
        <SelectRecordForLinkModal
            className={LINK_RECORDS_MODAL_CLASSNAME}
            open={open}
            childLibraryId={joinLibraryContext?.linkedLibrary || view.libraryId}
            onSelectionCompleted={isReplacement ? replaceLink : createLinks}
            replacementMode={isReplacement}
            selectionMode={isReplacement || !isMultiple ? 'simple' : 'multiple'}
            hideSelectAllAction={(isReplacement || !isMultiple) && view.entrypoint.type === 'link'}
            onClose={onClose}
        />
    );
};
