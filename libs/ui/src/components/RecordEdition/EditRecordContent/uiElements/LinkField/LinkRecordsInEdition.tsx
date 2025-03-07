// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Explorer} from '_ui/components/Explorer';
import {IExplorerRef} from '_ui/components/Explorer/Explorer';
import {ComponentProps, FunctionComponent, useState} from 'react';
import {FaList} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ExplorerWrapper} from './shared/ExplorerWrapper';
import LinkActionsButtons from './shared/LinkActionsButtons';

interface ILinkRecordsInCreationProps {
    libraryId: string;
    recordId: string;
    attributeId: string;
    columnsToDisplay: ComponentProps<typeof Explorer>['defaultViewSettings']['attributesIds'];
    explorerCallback: ComponentProps<typeof Explorer>['defaultCallbacks'];
    isReadOnly: boolean;
    isMultipleValues: boolean;
    hasNoValue: boolean;
}

const LinkRecordsInEdition: FunctionComponent<ILinkRecordsInCreationProps> = ({
    libraryId,
    recordId,
    attributeId,
    columnsToDisplay,
    explorerCallback,
    isReadOnly,
    isMultipleValues,
    hasNoValue
}) => {
    const {t} = useSharedTranslation();
    const [explorerActions, setExplorerActions] = useState<IExplorerRef | null>(null);

    const _handleExplorerRef = (ref: IExplorerRef) => {
        // console.log('ref', ref);
        //TODO: Prendre en compte link action et totalCount
        if (ref?.createAction?.disabled !== explorerActions?.createAction?.disabled) {
            setExplorerActions({
                createAction: ref?.createAction,
                linkAction: ref?.linkAction,
                totalCount: ref?.totalCount
            });
        }
    };

    const _getExplorerItemActions = (): Array<'edit' | 'remove'> => {
        if (isReadOnly) {
            return [];
        }

        return isMultipleValues && !hasNoValue ? undefined : ['edit'];
    };

    return (
        <>
            <ExplorerWrapper>
                <Explorer
                    ref={_handleExplorerRef}
                    defaultViewSettings={{
                        attributesIds: columnsToDisplay
                    }}
                    entrypoint={{
                        type: 'link',
                        parentLibraryId: libraryId,
                        parentRecordId: recordId,
                        linkAttributeId: attributeId
                    }}
                    defaultCallbacks={{
                        item: {
                            remove: explorerCallback.item.remove
                        },
                        mass: {
                            deactivate: explorerCallback.mass.deactivate
                        },
                        primary: {
                            link: explorerCallback.primary.link,
                            create: explorerCallback.primary.create
                        }
                    }}
                    showTitle={false}
                    showSearch={false}
                    disableSelection={isReadOnly || !isMultipleValues}
                    defaultActionsForItem={_getExplorerItemActions()}
                    hidePrimaryActions
                    hideTableHeader
                    iconsOnlyItemActions
                />
            </ExplorerWrapper>
            <LinkActionsButtons
                createButtonProps={{
                    icon: explorerActions?.createAction?.icon,
                    label: explorerActions?.createAction?.label,
                    callback: explorerActions?.createAction?.callback,
                    disabled: isReadOnly || explorerActions?.createAction?.disabled
                }}
                linkButtonProps={{
                    icon: <FaList />,
                    label: isMultipleValues
                        ? explorerActions?.linkAction?.label
                        : t('record_edition.replace-by-existing-item'),
                    callback: explorerActions?.linkAction?.callback,
                    disabled: isReadOnly || (isMultipleValues && explorerActions?.createAction?.disabled) //TODO: Should be fixed by explorer team
                }}
                hasNoValue={hasNoValue}
            />
        </>
    );
};

export default LinkRecordsInEdition;
