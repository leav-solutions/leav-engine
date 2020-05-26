import React from 'react';

interface IActiveLibraryContextProps {
    id: string;
    queryName: string;
}

const ActiveLibraryContext = React.createContext<IActiveLibraryContextProps | null>(null);

export default ActiveLibraryContext;
