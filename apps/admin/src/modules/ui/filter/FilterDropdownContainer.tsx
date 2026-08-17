import {type ReactNode} from 'react';
import {filterDropdownContainer} from './FilterDropdownContainer.module.css';

export const FilterDropdownContainer = ({children}: {children: ReactNode}) => (
    <div className={filterDropdownContainer}>{children}</div>
);
