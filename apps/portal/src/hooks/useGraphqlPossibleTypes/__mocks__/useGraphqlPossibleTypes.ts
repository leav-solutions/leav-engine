// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IUseGraphqlPossibleTypes} from 'hooks/useGraphqlPossibleTypes/useGraphqlPossibleTypes';

export default function (url: string, token: string): IUseGraphqlPossibleTypes {
    return {
        loading: false,
        error: '',
        possibleTypes: {
            Record: ['User', 'Product']
        }
    };
}
