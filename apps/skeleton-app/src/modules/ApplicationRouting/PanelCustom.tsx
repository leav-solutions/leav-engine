// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {iframe} from './PanelCustom.module.css';

interface IPanelCustomProps {
    source: string;
    searchQuery: string;
    title: string;
}

export const PanelCustom: FunctionComponent<IPanelCustomProps> = ({source, searchQuery, title}) => (
    <iframe className={iframe} name="testFrame" src={source + searchQuery} title={title} width="100%" height="100%" />
);
