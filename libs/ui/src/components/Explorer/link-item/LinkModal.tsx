// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useMemo} from 'react';
import {type JoinLibraryContextFragment, useExplorerLinkAttributeQuery} from '_ui/_gqlTypes';
import {type ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {SelectRecordForLinkModal} from '_ui/components/SelectRecordForLinkModal';
import {type IEntrypointLink} from '../_types';
import {useAddLinkMassAction} from './useAddLinkMassAction';
import {useViewSettingsContext} from '../manage-view-settings/store-view-settings/useViewSettingsContext';
import {useReplaceLinkMassAction} from './useReplaceLinkMassAction';
import {LINK_RECORDS_MODAL_CLASSNAME} from '../_constants';
import {SelectTreeNodeModal} from '_ui/components';
import {ITreeNodeWithRecord} from '_ui/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

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
    const {t} = useSharedTranslation();
    const {view} = useViewSettingsContext();
    const linkedLibraryId =
        joinLibraryContext &&
        'linked_library' in joinLibraryContext.mandatoryAttribute &&
        joinLibraryContext.mandatoryAttribute.linked_library?.id;
    const linkedTreeId =
        joinLibraryContext &&
        'linked_tree' in joinLibraryContext.mandatoryAttribute &&
        joinLibraryContext.mandatoryAttribute.linked_tree?.id;

    const isReplacement = !!linkId;

    const {data: attributeData} = useExplorerLinkAttributeQuery({
        skip: view.entrypoint.type !== 'link',
        variables: {
            id: (view.entrypoint as IEntrypointLink).linkAttributeId
        }
    });

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

    const linkAttributeData = attributeData?.attributes?.list[0];
    const isValuesListEnabled =
        linkAttributeData && 'valuesList' in linkAttributeData && linkAttributeData.valuesList?.enable;

    const valuesList = useMemo(
        () => (isValuesListEnabled ? linkAttributeData.valuesList?.linkedValues?.map(value => value.id) : undefined),
        [isValuesListEnabled, linkAttributeData]
    );
    const allowFreeEntry = useMemo(
        () => (isValuesListEnabled ? Boolean(linkAttributeData.valuesList?.allowFreeEntry) : false),
        [isValuesListEnabled, linkAttributeData]
    );

    return linkedTreeId ? (
        <SelectTreeNodeModal
            open
            attribute={{
                multiple_values: isMultivalue,
                linked_tree: {
                    id: linkedTreeId
                }
            }}
            title={t(isMultivalue ? 'tree-node-selection.title_many' : 'tree-node-selection.title')}
            // We can select new node(s), ignoring current value(s).
            // Selected element might be duplicated in link attribute in backend for now.
            backendValues={[]}
            onClose={onClose}
            onConfirm={selectedNodes => {
                const nodeIds = selectedNodes.map(node => node.id);
                if (isReplacement) {
                    replaceLink({
                        records: {
                            list: nodeIds.map(id => ({id}))
                        }
                    });
                } else {
                    createLinks({
                        records: {
                            list: nodeIds.map(id => ({id}))
                        }
                    });
                }
            }}
        />
    ) : (
        <SelectRecordForLinkModal
            className={LINK_RECORDS_MODAL_CLASSNAME}
            open={open}
            childLibraryId={linkedLibraryId || view.libraryId}
            onSelectionCompleted={isReplacement ? replaceLink : createLinks}
            replacementMode={isReplacement}
            selectionMode={isReplacement || !isMultivalue ? 'simple' : 'multiple'}
            hideSelectAllAction={(isReplacement || !isMultivalue) && view.entrypoint.type === 'link'}
            valuesList={valuesList}
            allowFreeEntry={allowFreeEntry}
            onClose={onClose}
        />
    );
};
