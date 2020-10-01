import {RecordIdentity_whoAmI} from '../../../../../../../../../../_gqlTypes/RecordIdentity';
import {defaultDepValue} from '../formBuilderReducer';

export default function(depValue: RecordIdentity_whoAmI | null): string {
    return !!depValue ? `${depValue.library.id}/${depValue.id}` : defaultDepValue;
}
