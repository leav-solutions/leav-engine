import {faAngleUp} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useIntersectionObserver} from '@uidotdev/usehooks';
import {KitButton} from 'aristid-ds';
import {type ReactNode, useRef} from 'react';
import styled from 'styled-components';

const StyledKitButtonGoUp = styled(KitButton)`
    position: absolute;
    right: calc(var(--general-spacing-m) * 1px);
    bottom: calc(var(--general-spacing-m) * 1px);
    z-index: 10;
`;

interface IRecordHistoryGoUpButtonProps {
    children: ReactNode;
    disabled?: boolean;
}

export const RecordHistoryGoUpButton: React.FC<IRecordHistoryGoUpButtonProps> = ({disabled, children}) => {
    // cannot use detectScrollTopRef because it is not a ref to div but to a customRef to a callback
    const scrollTopRef = useRef<HTMLDivElement>(null);

    // Detect if the top of the list is visible or not
    // to show or hide the "go up" button
    const [detectScrollTopRef, detectScrollTopEntry] = useIntersectionObserver<HTMLDivElement>({threshold: 0});
    const showGoUpButton = !detectScrollTopEntry?.isIntersecting;

    return disabled ? (
        <>{children}</>
    ) : (
        <div ref={scrollTopRef}>
            <div ref={detectScrollTopRef} />
            {children}
            {showGoUpButton && (
                <StyledKitButtonGoUp
                    type="segmented"
                    size="m"
                    icon={<FontAwesomeIcon icon={faAngleUp} />}
                    onClick={() => {
                        scrollTopRef.current?.scrollIntoView({behavior: 'smooth'});
                    }}
                />
            )}
        </div>
    );
};

export default RecordHistoryGoUpButton;
