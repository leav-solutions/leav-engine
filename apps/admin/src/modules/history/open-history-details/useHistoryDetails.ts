import {useState} from 'react';
import {type HistoryData} from '../types';

export const useHistoryDetails = () => {
    const [selectedRecord, setSelectedRecord] = useState<HistoryData | null>(null);

    const openDetails = (record: HistoryData) => {
        setSelectedRecord(record);
    };

    const closeDetails = () => {
        setSelectedRecord(null);
    };

    return {
        isOpen: selectedRecord !== null,
        selectedRecord,
        openDetails,
        closeDetails,
    };
};
