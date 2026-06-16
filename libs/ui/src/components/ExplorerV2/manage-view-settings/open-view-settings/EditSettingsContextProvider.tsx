import {type FunctionComponent, useState} from 'react';
import {EditSettingsContext, type IEditSettingsContext} from './EditSettingsContext';

interface IEditSettingsContextProviderProps {
    panelElement?: IEditSettingsContext['panelElement'];
    children: React.ReactNode;
}

export const EditSettingsContextProvider: FunctionComponent<IEditSettingsContextProviderProps> = ({
    children,
    panelElement,
}) => {
    const [activeSettings, setActiveSettings] = useState<IEditSettingsContext['activeSettings']>(null);
    const closeSettingsPanel = () => setActiveSettings(null);

    return (
        <EditSettingsContext.Provider
            value={{
                activeSettings,
                setActiveSettings,
                panelElement: panelElement ?? null,
                closeSettingsPanel,
            }}
        >
            {children}
        </EditSettingsContext.Provider>
    );
};
