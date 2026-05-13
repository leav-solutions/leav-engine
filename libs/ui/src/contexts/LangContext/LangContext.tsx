import {createContext} from 'react';
import {type ILangContext} from './types';

export const LangContext = createContext<ILangContext | null>(null);
