import {type ComponentProps, type FunctionComponent, useRef} from 'react';
import styled from 'styled-components';
import {closeKitSnackBar, KitButton, KitSpace, AntModal} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExchangeAlt, faEye, faPlus, faXmark} from '@fortawesome/free-solid-svg-icons';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {
    type ExplorerSelectionIdsQuery,
    type JoinLibraryContextFragment,
    RecordFilterCondition,
    useExplorerSelectionIdsLazyQuery,
} from '_ui/_gqlTypes';
import {Explorer} from '_ui/components/Explorer';
import {useEditRecordModal} from '../RecordEdition/EditRecordModal/useEditRecordModal';

const modalMaxWidth = 1_200;

const StyledModal = styled(AntModal)`
    && {
        width: 90vw;
        max-width: ${modalMaxWidth}px;

        .ant-modal-body {
            height: 80vh;
            overflow-y: auto;
        }

        .ant-modal-content {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 0;
        }

        .ant-modal-footer {
            flex: 0 0 auto;
            margin-top: 0;
        }
    }
`;

const ModalFooterStyledDiv = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: calc(var(--general-spacing-xs) * 1px) calc(var(--general-spacing-s) * 1px);
    border-top: 1px solid var(--general-utilities-border);
`;

const ModalMainStyledDiv = styled.div`
    padding: calc(var(--general-spacing-m) * 1px);
    height: 100%;
    position: relative;
`;

interface ISelectRecordForLinkModalProps {
    className?: string;
    open: boolean;
    childLibraryId: string;
    replacementMode: boolean;
    valuesList?: string[];
    allowFreeEntry: boolean;
    joinLibraryContext?: JoinLibraryContextFragment;
    selectionMode: ComponentProps<typeof Explorer>['selectionMode'];
    hideSelectAllAction: ComponentProps<typeof Explorer>['hideSelectAllAction'];
    isMultivalue: boolean;
    onSelectionCompleted: (data: ExplorerSelectionIdsQuery) => void;
    onClose: () => void;
    columnsToDisplay: string[];
}

export const SelectRecordForLinkModal: FunctionComponent<ISelectRecordForLinkModalProps> = ({
    className,
    open,
    childLibraryId,
    replacementMode,
    valuesList,
    allowFreeEntry,
    selectionMode,
    joinLibraryContext,
    hideSelectAllAction,
    isMultivalue,
    onSelectionCompleted,
    onClose,
    columnsToDisplay,
}) => {
    const {t} = useSharedTranslation();
    const explorerContainerRef = useRef<HTMLDivElement>(null);

    const _handleClose: ComponentProps<typeof KitButton>['onClick'] = () => {
        closeKitSnackBar();
        onClose();
    };

    const _closeButtonLabel: ComponentProps<typeof KitButton>['aria-label'] = String(t('global.close'));

    const _footer: ComponentProps<typeof AntModal>['footer'] = (
        <ModalFooterStyledDiv>
            <KitSpace>
                <KitButton
                    aria-label={_closeButtonLabel}
                    key="close"
                    icon={<FontAwesomeIcon icon={faXmark} />}
                    onClick={_handleClose}
                >
                    {_closeButtonLabel}
                </KitButton>
            </KitSpace>
        </ModalFooterStyledDiv>
    );

    const [getRecordIdsFromFilters] = useExplorerSelectionIdsLazyQuery({
        fetchPolicy: 'no-cache',
        onCompleted: onSelectionCompleted,
    });

    const {EditRecordModal, openEditRecordModal} = useEditRecordModal();

    return (
        <StyledModal
            className={className}
            open={open}
            onCancel={_handleClose}
            destroyOnClose
            closable={false}
            cancelText={t('global.cancel')}
            width="90vw"
            centered
            footer={_footer}
        >
            <ModalMainStyledDiv ref={explorerContainerRef}>
                <Explorer.EditSettingsContextProvider
                    panelElement={() => explorerContainerRef.current ?? document.body}
                >
                    <Explorer
                        title="SelectRecordForLinkModal"
                        entrypoint={{
                            type: 'library',
                            libraryId: childLibraryId,
                            valuesList,
                            allowFreeEntry,
                        }}
                        showCreateOnNoResultOnly
                        selectionMode={selectionMode}
                        hideSelectAllAction={hideSelectAllAction}
                        massActions={
                            isMultivalue
                                ? [
                                      {
                                          label: replacementMode
                                              ? t('explorer.massAction.replace-link')
                                              : t('explorer.massAction.add-link'),
                                          icon: replacementMode ? (
                                              <FontAwesomeIcon icon={faExchangeAlt} />
                                          ) : (
                                              <FontAwesomeIcon icon={faPlus} />
                                          ),
                                          callback: async massSelectionFilter => {
                                              await getRecordIdsFromFilters({
                                                  variables: {
                                                      libraryId: childLibraryId,
                                                      filters: massSelectionFilter,
                                                  },
                                              });
                                          },
                                      },
                                  ]
                                : []
                        }
                        defaultCallbacks={
                            !isMultivalue
                                ? {
                                      item: {
                                          select: async items => {
                                              await getRecordIdsFromFilters({
                                                  variables: {
                                                      libraryId: childLibraryId,
                                                      filters: [
                                                          {
                                                              field: 'id',
                                                              condition: RecordFilterCondition.EQUAL,
                                                              value: items.itemId,
                                                          },
                                                      ],
                                                  },
                                              });
                                          },
                                      },
                                  }
                                : {}
                        }
                        defaultViewSettings={{
                            attributesIds: columnsToDisplay,
                        }}
                        primaryActions={[]}
                        defaultActionsForItem={[]}
                        defaultMassActions={[]}
                        itemActions={[
                            {
                                label: t('explorer.edit-item'),
                                icon: <FontAwesomeIcon icon={faEye} />,
                                useItemActionOnRowClick: true,
                                callback: item => {
                                    openEditRecordModal({
                                        library: item.libraryId,
                                        record: {
                                            id: item.itemId,
                                            label: item.whoAmI?.label,
                                            subLabel: item.whoAmI?.subLabel,
                                            color: item.whoAmI?.color,
                                            library: {id: item.libraryId},
                                        },
                                        editionFormId: 'edition',
                                    });
                                },
                            },
                        ]}
                        defaultPrimaryActions={['create']}
                        joinLibraryContext={joinLibraryContext}
                        showSearch
                        ignoreViewByDefault
                    />
                    {EditRecordModal}
                    {/* TODO: avoid getting last view for user */}
                </Explorer.EditSettingsContextProvider>
            </ModalMainStyledDiv>
        </StyledModal>
    );
};
