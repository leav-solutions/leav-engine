import React from 'react';

export interface IUserContext {
    id: number | null;
    name: string | null;
    permissions: {[name: string]: boolean} | null;
}

/* tslint:disable-next-line:variable-name */
const UserContext = React.createContext<IUserContext | null>(null);

export default UserContext;
