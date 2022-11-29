# LEAV Engine - Preview Generator
## Introduction
Generate previews for images, video, pdf, etc.

## Error Codes
### Config Error
- 101: can't access the inputRootPath
- 102: can't access the outputRootPath

### Message Error
- 201: can't parse the message received

### Input Error
- 301: input file doesn't exist
- 302: input is not a file
- 303: error when getting input file stats
- 304: input file type unknown
- 305: type of the input file not manage

### Output Error
- 401: output file must be a png
- 402: can't create folder for output

### Generate Error
- 501: error when generating the preview
- 502: error when creating the temporary file for the document type
- 503: error when generating preview from temporary pdf document
- 504: error when getting the colorspace of the input

### MultiPage Error
- 601: error when create the folder for multi page
- 602: error when getting the number page of pdf
- 603: error when generating multi page

## Config file

```JSON
{
    "inputRootPath": "/data/",
    "outputRootPath": "/data/",
    "ICCPath": "/data/profile/",
    "amqp": {
        "protocol": "amqp",
        "hostname": "localhost",
        "port": 15672,
        "username": "guest",
        "password": "guest",
        "consume": {
            "queue": "consume",
            "exchange": "preview",
            "routingKey": "consume"
        },
        "publish": {
            "queue": "response",
            "exchange": "preview",
            "routingKey": "response"
        }
    }
}
```

### Detail:
**All params are mandatory**

- rootPath: path use to get the absolute path from the input and output get in message
- ICCPath: path to the folder that contains de profile (EuroscaleCoated.icc et srgb.icm)
- amqp
    - protocol: the protocol used to connect rabbitMQ
    - hostname: hostname used to connect rabbitMQ
    - port: port used to connect rabbitMQ
    - username: username used to connect rabbitMQ
    - password: password used to connect rabbitMQ
    - consume
        - queue: queue use to get the message
        - exchange: exchange use to get the message
        - routingKey: key use to get the messages from the queue by the exchange
    - publish:
        - queue: queue where the response is sent
        - exchange: exchange where the response is sent
        - routingKey: key use the connect the exchange to the queue


## Message received

```JSON
{
    "input": "preview/test.jpg",
    "context": "context",
    "versions": [
        {
            "background": false,
            "density": 300,
            "multiPage": "preview/muliPageFolder",
            "sizes": [
                {
                    "size": 800,
                    "output": "preview/test/test.800.png",
                    "name": "big"
                }
            ]
        }
    ]
}
```

### Detail

- input: relative to the file used to generate the preview
- context: context send in the response
- versions: a different version of the preview
    - background: background in the preview, true will display a checkerboard, false will display nothing and a string of a hexadecimal color will display that color
    - density: the resolution of the image
    - multiPage: path to the folder were to store the splitted pages, only work with pdf and document
    - sizes: different size of the previews
        - size: the size of the preview
        - output: the output of the preview
        - name: name of the preview generate

## Response sent

```JSON
{
    "responses": [{
        "error": 0,
        "error_detail": undefined,
        "params": {
            "background": false,
            "density": 300,
            "size": 800,
            "output": "/data/preview/test/test.800.png",
            "name": "big",
            "errorId": "string"
        }
    }],
    "context": "context"
}
```

### Detail:
- responses: response for each preview
    - error: code of the error, 0 is for no error
    - error_detail: error message is error, is be undefined if no error
    - params:
        - background: background use in the image
        - density: density of the image
        - size: size of the preview generate
        - output: absolute path to the output
        - name: name of the preview generate
- context: context given in the message reveived