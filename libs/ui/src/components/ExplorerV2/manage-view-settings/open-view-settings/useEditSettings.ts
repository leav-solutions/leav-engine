import {useContext} from 'react';
import {EditSettingsContext} from './EditSettingsContext';

export const useEditSettings = () => useContext(EditSettingsContext);
