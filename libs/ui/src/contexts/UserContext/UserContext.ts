import React from 'react';
import {type IUserContext} from './types';

export const UserContext = React.createContext<IUserContext | null>(null);
