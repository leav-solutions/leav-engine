// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PropsWithChildren, useEffect, useRef, useState} from 'react';

export interface ICloseOnBlurProps {
    isElementOpen: boolean;
    closeElement: () => any;
}

const NOT_FOCUSABLE_TAB_INDEX = -1;

function CloseOnBlur({isElementOpen, closeElement, children}: PropsWithChildren<ICloseOnBlurProps>): JSX.Element {
    const focusRef = useRef<HTMLInputElement>(null);
    const [isMouseInsideElement, setIsMouseInsideElement] = useState(false);

    useEffect(() => {
        if (isElementOpen) {
            focusRef.current?.focus();
        }
    }, [isElementOpen]);

    const handleBlur = () => {
        if (!isMouseInsideElement) {
            closeElement();
        } else {
            focusRef.current?.focus();
        }
    };

    return (
        <div onMouseEnter={() => setIsMouseInsideElement(true)} onMouseLeave={() => setIsMouseInsideElement(false)}>
            <input
                ref={focusRef}
                style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    width: 0,
                    height: 0
                }}
                tabIndex={NOT_FOCUSABLE_TAB_INDEX}
                onBlur={handleBlur}
                aria-hidden
            />
            {children}
        </div>
    );
}

export default CloseOnBlur;
