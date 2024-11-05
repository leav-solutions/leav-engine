// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IConfig {
    amqp: {
        protocol: string;
        exchange: string;
        hostname: string;
        port: number;
        username: string;
        password: string;
        type: string;
        queue: string;
        routingKey: string;
    };
    elasticsearch: {
        url: string;
    };
    debug: boolean;
}
