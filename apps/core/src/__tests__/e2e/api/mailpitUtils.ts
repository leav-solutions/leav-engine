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
        {timeoutMs: 20000}
    );

    const msg = await axios.get<IMailpitMsgFull>(`http://${mailpitAddress}/api/v1/message/${mailMsg.Data.ID}`, {
        responseType: 'json'
    });

    return msg.data;
}
