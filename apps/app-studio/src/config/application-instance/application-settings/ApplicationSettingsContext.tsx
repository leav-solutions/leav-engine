import {createContext, type useState} from 'react';
import {type Application} from '../../../modules/ApplicationRouting/types';

export const ApplicationSettingsContext = createContext<ReturnType<typeof useState<Application | null>>>(null);
