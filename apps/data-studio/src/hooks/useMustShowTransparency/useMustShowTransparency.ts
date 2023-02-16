// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useApplicationContext} from 'context/ApplicationContext';

const useMustShowTransparency = (): boolean => {
    const {currentApp} = useApplicationContext();

    return currentApp?.settings?.showTransparency ?? false;
};

export default useMustShowTransparency;
