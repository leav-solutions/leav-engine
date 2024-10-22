// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {KitIdCard, KitTag} from 'aristid-ds';
import {IDataGroupedFilteredSorted} from './types';

export const DataView: FunctionComponent<{dataGroupedFilteredSorted: IDataGroupedFilteredSorted<'whoAmI'>}> = ({
    dataGroupedFilteredSorted
}) => (
    <ul>
        {dataGroupedFilteredSorted.map(({itemId, value}) => (
            <li key={itemId} style={{display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px'}}>
                <KitTag idCardProps={{description: itemId}} /> |
                <KitIdCard
                    avatarProps={{label: value.label ?? '-'}}
                    title={value.label ?? '-'}
                    description={value.subLabel ?? '-'}
                />
            </li>
        ))}
    </ul>
);
