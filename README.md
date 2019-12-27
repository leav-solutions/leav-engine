# Introduction

Generate previews for images, video, pdf, etc.

# Dependencies

System:
- imagemagick (<=6.9)
- ffmpeg
- libreoffice
- unoconv

JS: 
- amqplib

# Error Code

- 1: file doesn't exist
- 2: input is not a file
- 3: error when getting file stats
- 4: file output must be a png
- 5: file type unknown
- 6: can't parse the message
- 11: error when generating the preview
- 12: error when creating the temporary file for the document type
- 13: error when generating preview from temporary pdf document
- 14: error when getting the colorspace of the input
- 15: error when creating the folder for multi-page
- 16: error when getting the number page of pdf
- 17: error when generating multi-page

# Config file 

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

## Detail: 

! All params are mandatory !

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


# Message received

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
                    "output": "preview/test/test.800.png"
                }
            ]
        }
    ]
}
```

## Detail

- input: relative to the file used to generate the preview
- context: context send in the response
- versions: a different version of the preview 
    - background: background in the preview, true will display a checkerboard, false will display nothing and a string of a hexadecimal color will display that color
    - density: the resolution of the image
    - multiPage: path to the folder were to store the splitted pages, only work with pdf and document
    - sizes: different size of the previews
        - size: the size of the preview
        - output: the output of the preview

# Response send

```JSON
{
    "responses": [{
        "error": 0,
        "error_detail": undefined, 
        "params": {
            "background": false,
            "density": 300,
            "size": 800,
            "output": "/data/preview/test/test.800.png"
        }
    }],
    "context": "context"
}
```

## Detail: 
- responses: response for each preview
    - error: code of the error, 0 is for no error
    - error_detail: error message is error, is be undefined if no error
    - params:
        - background: background use in the image
        - density: density of the image
        - size: size of the preview generate
        - output: absolute path to the output
- context: context given in the message reveived