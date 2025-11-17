// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import axios from 'axios';
import WebSocket from 'ws';
import {waitWebSocketMessage} from './e2eUtils';
import {getConfig} from '../../../config';

interface IMailpitMsgLight {
    From: {
        Name: string;
        Address: string;
    };
    ID: string;
    MessageID: string;
    Read: boolean;
    Size: number;
    Subject: string;
    To: Array<{
        Name: string;
        Address: string;
    }>;
}

interface IMailpitMsgFull extends IMailpitMsgLight {
    HTML: string;
    Text: string;
}

interface IMailpitSearchResult {
    messages: IMailpitMsgLight[];
    total: number;
    unread: number;
    //...
}

// https://mailpit.axllent.org/docs/api-v1/websocket/
interface IMailpitWebSocketMsg {
    Type: string;
    Data: IMailpitMsgLight;
}

const getMailpitAddress = async (): Promise<string> => {
    const config = await getConfig();
    return `${config.mailer.host}:8025`; // port is not smtp 1025, but api which default is 8025
};

export async function waitMailpitMessage(acceptMessage: (msg: IMailpitMsgLight) => boolean): Promise<IMailpitMsgFull> {
    const mailpitAddress = await getMailpitAddress();

    // Connect to Mailpit WebSocket to listen for new messages
    const webSocket = new WebSocket(`ws://${mailpitAddress}/api/events`);
    const mailMsg = await waitWebSocketMessage<IMailpitWebSocketMsg>(
        webSocket,
        msg => msg.Type === 'new' && acceptMessage(msg.Data),
        {timeoutMs: 20000},
    );

    const msg = await axios.get<IMailpitMsgFull>(`http://${mailpitAddress}/api/v1/message/${mailMsg.Data.ID}`, {
        responseType: 'json',
    });

    return msg.data;
}

export async function deleteMailpitMessagesBySearch(search: string): Promise<void> {
    const mailpitAddress = await getMailpitAddress();
    await axios.delete(`http://${mailpitAddress}/api/v1/search?query=${encodeURIComponent(search)}`);
}

export async function searchMailpitMessages(search: string): Promise<IMailpitSearchResult> {
    const mailpitAddress = await getMailpitAddress();
    const msg = await axios.get<IMailpitSearchResult>(
        `http://${mailpitAddress}/api/v1/search?query=${encodeURIComponent(search)}`,
    );
    return msg.data;
}

export async function waitForMailpitSearchMessage(
    search: string,
    timeoutMs: number = 5000,
    intervalMs: number = 20,
): Promise<IMailpitMsgLight[]> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const result = await searchMailpitMessages(search);
        if (result.messages.length > 0) {
            return result.messages;
        }
        await new Promise(res => setTimeout(res, intervalMs));
    }
    throw new Error(`No messages found for search "${search}" within ${timeoutMs}ms`);
}
