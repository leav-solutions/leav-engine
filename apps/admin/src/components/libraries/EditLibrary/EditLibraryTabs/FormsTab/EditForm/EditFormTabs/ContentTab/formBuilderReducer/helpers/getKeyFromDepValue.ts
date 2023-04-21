// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordIdentity_whoAmI} from '../../../../../../../../../../_gqlTypes/RecordIdentity';
import {defaultDepValue} from '../formBuilderReducer';

export default function getKeyFromDepValue(depValue: RecordIdentity_whoAmI | null): string {
    return !!depValue ? `${depValue.library.id}/${depValue.id}` : defaultDepValue;
}
