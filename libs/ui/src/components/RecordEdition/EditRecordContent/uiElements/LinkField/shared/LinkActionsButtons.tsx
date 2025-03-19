// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPrimaryAction} from '_ui/components/Explorer/_types';
import {KitButton, KitSpace} from 'aristid-ds';
import {IKitButton} from 'aristid-ds/dist/Kit/General/Button/types';
import {FunctionComponent} from 'react';
import styled from 'styled-components';

const ActionButton = styled(KitButton)<{$hasNoValue: boolean}>`
    margin-top: ${props => (props.$hasNoValue ? 0 : 'calc((var(--general-spacing-xs)) * 1px)')};
`;

interface ILinkActionsButtonsProps {
    createButtonProps: IPrimaryAction;
    linkButtonProps: IPrimaryAction;
    hasNoValue: boolean;
}

type ActionButtonCommonProps = Partial<IKitButton> & {$hasNoValue: boolean};

export const LinkActionsButtons: FunctionComponent<ILinkActionsButtonsProps> = ({
    createButtonProps,
    linkButtonProps,
    hasNoValue
}) => {
    const actionButtonCommonProps: ActionButtonCommonProps = {
        type: 'secondary',
        size: 'm',
        $hasNoValue: hasNoValue
    };

    return (
        <KitSpace size="xs">
            <ActionButton
                {...actionButtonCommonProps}
                icon={createButtonProps.icon}
                disabled={createButtonProps.disabled}
                onClick={createButtonProps.callback}
            >
                {createButtonProps.label}
            </ActionButton>
            <ActionButton
                {...actionButtonCommonProps}
                icon={linkButtonProps.icon}
                disabled={linkButtonProps.disabled}
                onClick={linkButtonProps.callback}
            >
                {linkButtonProps.label}
            </ActionButton>
        </KitSpace>
    );
};
