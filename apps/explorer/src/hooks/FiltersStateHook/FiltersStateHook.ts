// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useContext} from 'react';
import {FilterStateContext} from './FilterStateContext';

const useStateFilters = () => useContext(FilterStateContext);

export default useStateFilters;
