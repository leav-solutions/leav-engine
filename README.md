# AUTOMATE-SCAN

## Config

First argument at launch must be the path to the config file
By default, the script take the file in `./config/config.json`

### Example of configuration file:

```
{
  "rootPath": "./folder_to_watch", // path to the folder to watch
  "rootKey": "1234abc", // key of the folder to watch
  "redis": { 
    "host": "127.0.0.1",
    "port": 6379
  },
  "amqp": { // parameters for rabbitmq configuration
    "protocol": "amqp", // protocol rabbitmq
    "hostname": "localhost", // hostname rabbitmq
    "port": 15672, // port rabbitmq
    "username": "guest", // username rabbitmq
    "password": "guest", // password rabbitmq
    "queue": "log" // queue where send the messages
  },
  "watcher": { // watcher config
    "awaitWriteFinish": { // wait for writing to finish before trigger event
      "stabilityThreshold": 2000, // (default: 2000)Amount of time in milliseconds for a file size to remain constant before emitting its event.
      "pollInterval": 100 // (default: 100) File size polling interval, in milliseconds.
    }
  },
  "verbose": true // display console.info when events is trigger
}
```

`rootPath`: path to the folder to watch, if absolute the name of the folder will not appear in message.
`rootKey`: key of the folder to watch, if not given, it will be generate with a hash of the rootPath
`redis`: informations to connect to redis
`amqp`: informations to use RabbitMQ
`watcher`: config for the watcher
`verbose`: allow the app to display informations messages

## Error code
- Commun errror:
  - `0`: User stop the app
  - `1`: Error uncaught 
  - `2`: rootPath folder not found
- Error with rabbitmq: 
  - `101`: Can't connect to RabbitMQ
  - `102`: Error when assert exchange
  - `103`: Error when assert queue
  - `104`: Error when bind queue
  - `105`: Can't publish to rabbitMQ
- Error with redis:
  - `201`: Error with redis

## Messend send

```
{
  event: string,
  time: number,
  pathAfter: string,
  pathBefore: string,
  inode: number,
  isDirectory: boolean,
  rootKey: any
}
```

`event`: the event occurred
`time`: timestamp when the message is sent
`pathAfter`: path of the file/folder after the event occurred
`pathBefore`: path of the file/folder before the event occurred
`inode`: id of the file/folder
`isDirectory`: the event occurred on a folder or not
`rootKey`: information given in the config return here  