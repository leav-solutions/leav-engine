import React from 'react';

export interface IUserContext {
    id: number;
    name: string;
    permissions: {[name: string]: boolean};
}

/* tslint:disable-next-line:variable-name */
const UserContext = React.createContext<IUserContext | null>(null);

export default UserContext;
