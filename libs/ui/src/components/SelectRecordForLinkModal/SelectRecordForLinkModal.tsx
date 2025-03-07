// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent, useRef} from 'react';
import styled from 'styled-components';
import {closeKitSnackBar, KitButton, KitSpace, AntModal} from 'aristid-ds';
// TODO: harmonize icon sources
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FaPlus} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ExplorerSelectionIdsQuery, useExplorerSelectionIdsLazyQuery} from '_ui/_gqlTypes';
import {Explorer} from '_ui/components/Explorer';

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
    open: boolean;
    childLibraryId: string;
    selectionMode: ComponentProps<typeof Explorer>['selectionMode'];
    hideSelectAllAction: ComponentProps<typeof Explorer>['hideSelectAllAction'];
    onSelectionCompleted: (data: ExplorerSelectionIdsQuery) => void;
    onClose: () => void;
}

export const SelectRecordForLinkModal: FunctionComponent<ISelectRecordForLinkModalProps> = ({
    open,
    childLibraryId,
    selectionMode,
    hideSelectAllAction,
    onSelectionCompleted,
    onClose
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
        onCompleted: onSelectionCompleted
    });

    return (
        <StyledModal
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
                        entrypoint={{
                            type: 'library',
                            libraryId: childLibraryId
                        }}
                        selectionMode={selectionMode}
                        hideSelectAllAction={hideSelectAllAction}
                        massActions={[
                            {
                                label: t('explorer.massAction.add-link'),
                                icon: <FaPlus />,
                                callback: async massSelectionFilter => {
                                    await getRecordIdsFromFilters({
                                        variables: {
                                            libraryId: childLibraryId,
                                            filters: massSelectionFilter
                                        }
                                    });
                                }
                            }
                        ]}
                        primaryActions={[]}
                        defaultActionsForItem={[]}
                        defaultMassActions={[]}
                        itemActions={[]}
                        defaultPrimaryActions={[]}
                    />
                    {/* TODO: avoid getting last view for user */}
                </Explorer.EditSettingsContextProvider>
            </ModalMainStyledDiv>
        </StyledModal>
    );
};
