# Laravel + Vue form processing

Contains component mixin, Laravel helpers and validation rules translation.

Validation messages are stored on client-side so Laravel application just returns a JSON response
with validation rules and arguments without a human readable messages. Response example:

```
{
    "password": {
        "Min": [3]
    },
    "name": {
        "Required": []
    },
}
```

Response is processed with placeholder replacements from `validation/{lang}.js` files.

```
password.Min (3) -> "Field 'password' must contain at least 3 letters"
name.Required() -> "Field 'name' is required"
```