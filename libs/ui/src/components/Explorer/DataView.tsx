// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {IDataGroupedFilteredSorted} from '_ui/components/Explorer/types';

export const DataView: FunctionComponent<{data: IDataGroupedFilteredSorted[]}> = ({data}) => (
    <div>Display data as list</div>
);
