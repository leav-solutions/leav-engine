export enum ErrorList {
    // no error
    'preview create' = 0,
    // config
    "can't access the inputRootPath" = 101,
    "can't access the outputRootPath" = 102,

    // message
    "can't parse the message received" = 201,

    // input
    "input file doesn't exist" = 301,
    'input is not a file' = 302,
    'error when getting input file stats' = 303,
    'input file type unknown' = 304,
    'type of the input file not manage' = 305,

    // output
    'output file must be a png' = 401,
    "can't create folder for output" = 402,

    // generate
    'error when generating the preview' = 501,
    'error when creating the temporary file for the document type' = 502,
    'error when generating preview from temporary pdf document' = 503,
    'error when getting the colorspace of the input' = 504,

    // multiPage
    'error when create the folder for multi page' = 601,
    'error when getting the number page of pdf' = 602,
    'error when generating multi page' = 603
}

export enum ErrorCodeType {
    'config error' = 100,
    'message receive error' = 200,
    'input error' = 300,
    'output error' = 400,
    'generate preview error' = 500,
    'multiPage error' = 600
}
