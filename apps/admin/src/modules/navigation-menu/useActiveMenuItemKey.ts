import {useRef} from 'react';
import {useLocation} from 'react-router-dom';
import {AdminAbsolutePaths} from '../routes/paths';

export const useActiveMenuItemKey = (): string => {
    const {pathname} = useLocation();
    const lastValidKeyRef = useRef('');
    const currentSegment = pathname.split('/').filter(Boolean)[0] ?? '';

    if (currentSegment !== AdminAbsolutePaths.notFound.slice(1)) {
        lastValidKeyRef.current = currentSegment;
    }

    return lastValidKeyRef.current;
};
