import {KitTypography} from 'aristid-ds';
import {type ReactNode} from 'react';
import {displaySection, displaySectionFields} from './attributeDisplayTab.module.css';

interface IDisplaySectionProps {
    title: string;
    children: ReactNode;
}

export const DisplaySection = ({title, children}: IDisplaySectionProps) => (
    <section className={displaySection}>
        <KitTypography.Title level="h3">{title}</KitTypography.Title>
        <div className={displaySectionFields}>{children}</div>
    </section>
);
