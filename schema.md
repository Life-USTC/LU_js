# declare.json schema explained

## `version`

Version numbering should look like `major.small.patch`, see versioning

## `inputs`

These declarations are used to hint the program how to make the input form.

<!-- Currently all inputs will be passed to the js script as a single object.

```js
var input = {
    "key_1" = "value_1",
}
```
-->

### `input_type`

The input type is used to hint the program how to render the UI, currently we support:

- `textfiled` - a single line text input
- `textarea` - a multiline text input
- `picker` - a dropdown menu
- `enum_picker` a horizontal list of buttons
- `checkbox` - a checkbox

For `picker`, `enum_picker` and `checkbox` you need to provide a `options` array, like these:

```json
{
    "name": "key_1",
    "input_type": "picker",
    "options": [
        "option_1",
        "option_2",
        "option_3"
    ]
}
```

### `is_password`

### `default_value`

## `function_supported`

List of reserved keywords to indicate which functionality does the js script support, you shouldn't write anything beyond your script supports

## `urls`

List of urls the script calls network functions on, used for code review primarily and might be needed on some platform
