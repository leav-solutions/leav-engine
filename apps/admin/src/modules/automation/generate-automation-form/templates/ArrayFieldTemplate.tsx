import {KitSpace} from 'aristid-ds';
import {type ArrayFieldTemplateProps} from '@rjsf/utils';

export const ArrayFieldTemplate = ({items}: ArrayFieldTemplateProps) => (
    <KitSpace direction="vertical" size="xs" style={{width: '100%'}}>
        {items}
    </KitSpace>
);
