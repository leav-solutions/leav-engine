import {type IFormDividerSettings} from '@leav/utils';
import {Divider} from 'antd';
import {type IFormElementProps} from '../../_types';

function FormDivider({element}: IFormElementProps<IFormDividerSettings>): JSX.Element {
    const label = element.settings.title ?? null;
    return <Divider>{label}</Divider>;
}

export default FormDivider;
