// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {JoinLibraryContextFragment} from '_ui/_gqlTypes';
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
    isMultivalue: boolean;
    onClose: () => void;
    onLink?: (saveValuesResult: ISubmitMultipleResult) => void;
    onReplace?: (replaceValuesResult: ISubmitMultipleResult) => void;
}

export const LinkModal: FunctionComponent<ILinkModalProps> = ({
    open,
    linkId,
    joinLibraryContext,
    isMultivalue,
    onLink,
    onReplace,
    onClose
}) => {
    const {view} = useViewSettingsContext();
    const linkedLibraryId =
        joinLibraryContext &&
        'linked_library' in joinLibraryContext.mandatoryAttribute &&
        joinLibraryContext.mandatoryAttribute.linked_library?.id;

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
            childLibraryId={linkedLibraryId || view.libraryId}
            onSelectionCompleted={isReplacement ? replaceLink : createLinks}
            replacementMode={isReplacement}
            selectionMode={isReplacement || !isMultivalue ? 'simple' : 'multiple'}
            hideSelectAllAction={(isReplacement || !isMultivalue) && view.entrypoint.type === 'link'}
            onClose={onClose}
        />
    );
};
