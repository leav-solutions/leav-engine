// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {useExplorerLinkAttributeQuery} from '_ui/_gqlTypes';
import {ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {SelectRecordForLinkModal} from '_ui/components/SelectRecordForLinkModal';
import {IEntrypointLink} from '../_types';
import {useLinkMassAction} from './useLinkMassAction';
import {useViewSettingsContext} from '../manage-view-settings/store-view-settings/useViewSettingsContext';

interface ILinkModalProps {
    open: boolean;
    onClose: () => void;
    onLink?: (saveValuesResult: ISubmitMultipleResult) => void;
}

export const LinkModal: FunctionComponent<ILinkModalProps> = ({open, onLink, onClose}) => {
    const {view} = useViewSettingsContext();

    const {data: attributeData} = useExplorerLinkAttributeQuery({
        skip: view.entrypoint.type !== 'link',
        variables: {
            id: (view.entrypoint as IEntrypointLink).linkAttributeId
        }
    });

    const isMultiple = attributeData?.attributes?.list?.[0]?.multiple_values;

    const {createLinks} = useLinkMassAction({
        store: {view},
        linkAttributeId: (view.entrypoint as IEntrypointLink).linkAttributeId,
        onLink,
        closeModal: onClose
    });

    return (
        <SelectRecordForLinkModal
            open={open}
            childLibraryId={view.libraryId}
            onSelectionCompleted={createLinks}
            selectionMode={isMultiple ? 'multiple' : 'simple'}
            hideSelectAllAction={!isMultiple && view.entrypoint.type === 'link'}
            onClose={onClose}
        />
    );
};
