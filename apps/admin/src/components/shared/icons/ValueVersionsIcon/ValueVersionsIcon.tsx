import {type ICustomIconProps} from '../../CustomIcon/CustomIcon';
import React from 'react';
import CustomIcon from '../../CustomIcon';
import IconSvg from './ValueVersionsIcon.svg';

const ValueVersionsIcon = (iconProps: Omit<ICustomIconProps, 'svg'>) => (
    <CustomIcon svg={String(IconSvg)} label="value versions" {...iconProps} />
);

export default ValueVersionsIcon;
