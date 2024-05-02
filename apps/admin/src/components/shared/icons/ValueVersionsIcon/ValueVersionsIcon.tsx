// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICustomIconProps} from 'components/shared/CustomIcon/CustomIcon';
import React from 'react';
import CustomIcon from '../../CustomIcon';
import IconSvg from './ValueVersionsIcon.svg';

const ValueVersionsIcon = (iconProps: Omit<ICustomIconProps, 'svg'>) => <CustomIcon svg={String(IconSvg)} label="value versions" {...iconProps} />;

export default ValueVersionsIcon;
