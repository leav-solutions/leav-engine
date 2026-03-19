// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
