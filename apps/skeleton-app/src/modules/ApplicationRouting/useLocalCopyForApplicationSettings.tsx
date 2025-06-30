// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetApplicationSkeletonSettingsQuery} from '../../__generated__';
import {useEffect, useState} from 'react';
import {IApplication} from './types';

export const useLocalCopyForApplicationSettings = () => {
    const {data} = useGetApplicationSkeletonSettingsQuery();
    const [application, setApplication] = useState<IApplication | null>(null);
    useEffect(() => {
        setApplication(data?.applications?.list[0].settings ?? null);
    }, [data?.applications?.list[0].settings]);

    return [application, setApplication] as const;
};
