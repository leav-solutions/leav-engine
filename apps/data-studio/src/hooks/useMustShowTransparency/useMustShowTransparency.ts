import {useApplicationContext} from '../../context/ApplicationContext';

const useMustShowTransparency = (): boolean => {
    const {currentApp} = useApplicationContext();

    return currentApp?.settings?.showTransparency ?? false;
};

export default useMustShowTransparency;
