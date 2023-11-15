// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache} from '@apollo/client';
import {attributesPossibleTypes} from '../fragmentMatchers/attributesFragmentMatchers';

export const getMockCacheWithFragments = () => new InMemoryCache({possibleTypes: attributesPossibleTypes});
