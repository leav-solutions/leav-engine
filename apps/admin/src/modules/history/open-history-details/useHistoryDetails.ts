// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
