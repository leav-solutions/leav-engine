// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInput} from 'aristid-ds';
import {type DataNode} from 'antd/es/tree';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useState} from 'react';

export const useSmartFilterSearch = (smartFilterData: DataNode[]) => {
    const {t} = useSharedTranslation();
    const [searchValue, setSearchValue] = useState('');

    const normalizedSearch = searchValue.trim().toLowerCase();

    const filteredSmartFilterData = !normalizedSearch
        ? smartFilterData
        : smartFilterData.filter(node => {
              const title = typeof node.title === 'string' ? node.title : '';
              return title.toLowerCase().includes(normalizedSearch);
          });

    return {
        filteredSmartFilterData,
        SearchInput: (
            <KitInput
                prefix={<FontAwesomeIcon icon={faSearch} />}
                placeholder={t('global.search')}
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                allowClear
            />
        ),
    };
};
