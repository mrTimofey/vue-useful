<?php

use Illuminate\Contracts\Validation\Factory as ValidatorFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator;

/**
 * Make json response.
 * @param $data
 * @param int $status
 * @param array $headers
 * @return JsonResponse
 */
function json_response($data, int $status = 200, array $headers = []): JsonResponse {
	return new JsonResponse($data, $status, $headers, JSON_UNESCAPED_UNICODE);
}

/**
 * Make validator.
 * @param mixed $data data to validate
 * @param array $rules validation rules
 * @param array $messages validation messages
 * @param array $customAttributes validation custom attributes
 * @return Validator
 */
function make_validator($data, array $rules, array $messages = [], array $customAttributes = []): Validator {
	return app(ValidatorFactory::class)->make($data, $rules, $messages, $customAttributes);
}

/**
 * Validate data with validator.
 * @param $data
 * @param array $rules
 * @param array $messages
 * @param array $customAttributes
 * @throws ValidationException
 */
function validate_data($data, array $rules, array $messages = [], array $customAttributes = []): void {
	$validator = make_validator($data, $rules, $messages, $customAttributes);
	if ($validator->fails()) {
		throw new ValidationException($validator, json_response($validator->failed(), 422));
	}
}
