import {InMemoryCache} from '@apollo/client';
import {attributesPossibleTypes} from '../fragmentMatchers/attributesFragmentMatchers';

export const getMockCacheWithFragments = () => new InMemoryCache({possibleTypes: attributesPossibleTypes});
