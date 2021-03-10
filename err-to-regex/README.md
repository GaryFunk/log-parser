# errdef

description

## How to use

All errors files must have the `.error.json` file extension for the parser to pick it up at runtime.

Each `.error.json` file must contain the following **required** fields:

- name: string
- description: string
- path: string
- value : string

**NOTE** it's recommended that you pass a base64encoded value to the `value` key instead of worrying about escaping certain characters -- the parser will update the file with an escaped string (raw_value) at runtime.

Optional fields can be added for additional functionality:

- hooks (array(object)) : array of actions to run when an error is detected
- limit_to (array(string)) : list of files to check for error
- hooks_async (boolean)

## Hooks

