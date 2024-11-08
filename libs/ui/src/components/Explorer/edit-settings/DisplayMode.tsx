import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FunctionComponent} from 'react';

export const DisplayMode: FunctionComponent = () => {
    const {t} = useSharedTranslation();

    return <div>DISPLAY MODE</div>;
};
