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
