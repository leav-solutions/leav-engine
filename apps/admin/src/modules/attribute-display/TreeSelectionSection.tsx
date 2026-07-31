import {KitTypography} from 'aristid-ds';
import {type ReactNode} from 'react';
import {treeSelectionSection, treeSelectionSectionFields} from './attributeDisplayTab.module.css';

interface ITreeSelectionSectionProps {
    title: string;
    children: ReactNode;
}

export const TreeSelectionSection = ({title, children}: ITreeSelectionSectionProps) => (
    <section className={treeSelectionSection}>
        <KitTypography.Title level="h3">{title}</KitTypography.Title>
        <div className={treeSelectionSectionFields}>{children}</div>
    </section>
);
