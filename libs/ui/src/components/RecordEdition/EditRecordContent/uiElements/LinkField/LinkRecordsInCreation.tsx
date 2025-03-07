// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {FaList, FaPlus} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {Explorer} from '_ui/components/Explorer';
import {ExplorerWrapper} from './shared/ExplorerWrapper';
import LinkActionsButtons from './shared/LinkActionsButtons';

interface ILinkRecordsInCreationProps {
    libraryId: string;
    isReadOnly: boolean;
    isMultipleValues: boolean;
    hasNoValue: boolean;
}

const LinkRecordsInCreation: FunctionComponent<ILinkRecordsInCreationProps> = ({
    libraryId,
    isReadOnly,
    isMultipleValues,
    hasNoValue
}) => {
    const {t} = useSharedTranslation();

    return (
        <>
            <ExplorerWrapper>
                <Explorer
                    entrypoint={{
                        type: 'library',
                        libraryId
                    }}
                    selectionMode={isMultipleValues ? 'multiple' : 'simple'}
                    // hideSelectAllAction={!isMultipleValues && view.entrypoint.type === 'link'}
                    primaryActions={[]}
                    defaultActionsForItem={[]}
                    defaultMassActions={[]}
                    // massActions={addLinkMassAction ? [addLinkMassAction] : []}
                    itemActions={[]}
                    defaultPrimaryActions={[]}
                    noPagination
                />
            </ExplorerWrapper>
            <LinkActionsButtons
                createButtonProps={{
                    icon: <FaPlus />,
                    label: 'TODO',
                    callback: () => console.log('TODO'),
                    disabled: isReadOnly
                }}
                linkButtonProps={{
                    icon: <FaList />,
                    label: 'TODO',
                    callback: () => console.log('TODO'),
                    disabled: isReadOnly || isMultipleValues
                }}
                hasNoValue={hasNoValue}
            />
        </>
    );
};

export default LinkRecordsInCreation;
