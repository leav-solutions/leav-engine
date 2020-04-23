import React from 'react';

export interface IUserContext {
    id: number;
    name: string;
    permissions: {[name: string]: boolean};
}

const UserContext = React.createContext<IUserContext | null>(null);

export default UserContext;
