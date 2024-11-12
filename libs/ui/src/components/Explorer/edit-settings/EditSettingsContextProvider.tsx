// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useState} from 'react';
import {EditSettingsContext, IEditSettingsContext} from './EditSettingsContext';

export const EditSettingsContextProvider: FunctionComponent = ({children}) => {
    const [activeSettings, setActiveSettings] = useState<IEditSettingsContext['activeSettings']>(null);
    const onClose = () => setActiveSettings(null);

    return (
        <EditSettingsContext.Provider
            value={{
                activeSettings,
                setActiveSettings,
                onClose
            }}
        >
            {children}
        </EditSettingsContext.Provider>
    );
};
