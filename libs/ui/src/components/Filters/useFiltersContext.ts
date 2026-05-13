import {useContext} from 'react';
import {FiltersContext} from './context/filtersContext';

export const useFiltersContext = () => {
    const context = useContext(FiltersContext);
    if (!context) {
        throw new Error('FiltersContext must be used inside a <FiltersProvider />');
    }
    return context;
};
