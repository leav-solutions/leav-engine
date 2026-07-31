import {type ICommonFieldsSettings} from '@leav/utils';
import {type FunctionComponent} from 'react';
import {useTreeAttributeV2Flags} from '_ui/hooks/useTreeAttributeV2Flags';
import {type IFormElementProps} from '../_types';
import TreeField from './TreeField';
import TreeFieldV2 from './TreeFieldV2';

/**
 * The `formComponents` mapping is a static table, a hook cannot live in it: this component is the
 * place where the `enableTreeAttributeV2Form` flag routes tree fields to their V2.
 *
 * Renders nothing while the flags are loading: rendering V1 on that transient state then flipping to
 * V2 once the response arrives would remount the field (lost local state, effects replayed). The modal
 * choice is made inside the V1 field (`useManageTreeNodeSelection`), so this single gate covers both.
 *
 * Cleanup of the epic = deleting this file and pointing the mapping back to `TreeField`.
 */
const TreeFieldSwitch: FunctionComponent<IFormElementProps<ICommonFieldsSettings>> = props => {
    const {loading, isFormV2Enabled} = useTreeAttributeV2Flags();

    if (loading) {
        return null;
    }

    return isFormV2Enabled ? <TreeFieldV2 {...props} /> : <TreeField {...props} />;
};

export default TreeFieldSwitch;
