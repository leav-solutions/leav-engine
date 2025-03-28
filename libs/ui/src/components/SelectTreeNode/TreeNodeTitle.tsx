// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitTypography} from 'aristid-ds';
import {FunctionComponent, ReactNode} from 'react';
import {FaCheck} from 'react-icons/fa';

interface ITreeNodeTitleProps {
    title: ReactNode;
    checkable?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
}

export const TreeNodeTitle: FunctionComponent<ITreeNodeTitleProps> = ({title, checkable, isSelected, isDisabled}) =>
    checkable ? (
        <>{title}</>
    ) : (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <KitTypography.Text size="fontSize5" disabled={isDisabled}>
                {title}
            </KitTypography.Text>
            {isSelected && (
                <FaCheck
                    color={isDisabled ? 'var(--general-utilities-text-disabled)' : 'var(--general-utilities-text-blue)'}
                />
            )}
        </div>
    );
