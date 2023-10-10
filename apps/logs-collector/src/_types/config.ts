// Copyright LEAV Solutions 2017
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
