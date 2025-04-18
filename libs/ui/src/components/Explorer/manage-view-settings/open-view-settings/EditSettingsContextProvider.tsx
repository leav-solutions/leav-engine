// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useState} from 'react';
import {EditSettingsContext, IEditSettingsContext} from './EditSettingsContext';

interface IEditSettingsContextProviderProps {
    panelElement?: IEditSettingsContext['panelElement'];
    children: React.ReactNode;
}

export const EditSettingsContextProvider: FunctionComponent<IEditSettingsContextProviderProps> = ({
    children,
    panelElement
}) => {
    const [activeSettings, setActiveSettings] = useState<IEditSettingsContext['activeSettings']>(null);
    const closeSettingsPanel = () => setActiveSettings(null);

    return (
        <EditSettingsContext.Provider
            value={{
                activeSettings,
                setActiveSettings,
                panelElement: panelElement ?? null,
                closeSettingsPanel
            }}
        >
            {children}
        </EditSettingsContext.Provider>
    );
};
