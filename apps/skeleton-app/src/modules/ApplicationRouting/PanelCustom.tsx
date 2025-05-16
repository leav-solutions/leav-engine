import {FunctionComponent, useEffect} from 'react';
import {iframe} from './PanelCustom.module.css';

interface IPanelCustomProps {
    source: string;
    searchQuery: string;
    title: string;
}

export const PanelCustom: FunctionComponent<IPanelCustomProps> = ({source, searchQuery, title}) => {
    useEffect(() => {
        const _handler: Parameters<typeof addEventListener<'message'>>[1] = event => {
            if (source.includes(event.origin)) {
                console.log('hello', event);
            }
        };

        window.addEventListener('message', _handler);
        return () => {
            window.removeEventListener('message', _handler);
        };
    }, []);

    return (
        <iframe
            className={iframe}
            name="testFrame"
            src={source + searchQuery}
            title={title}
            width="100%"
            height="100%"
        />
    );
};
