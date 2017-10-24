/*
{
    name,
	title ?= name,
	value,
	type ?= 'text',
	rule: {
		name,
		args: [arg1, arg2]
	},
	rules: {
		rule1: [arg1, arg2],
		rule2: [arg1, arg2],
		...
	},
	fields: {
		fieldName1: {
            title ?= name,
			value,
            type ?= 'text',
			rules: {
				rule1: [arg1, arg2],
				rule2: [arg1, arg2]
			}
		},
		...
	}
}
*/

const required = 'Заполните {{ title }}',
	mimes = 'Файл {{ title }} должен быть одним из типов [0]',
	unique = 'Такое значение поля {{ title }} уже существует',
	url = 'Неверный формат ссылки';

function compareFailed(type, title, str) {
	switch (type) {
		case 'array': return `Поле ${title} должно содержать ${str} элементов`;
		case 'file': return `Файл ${title} должен быть ${str} KB`;
		case 'number': return `Число ${title} должно быть ${str}`;
		default: return `Поле ${title} должно содержать ${str} символов`;
	}
}

export default {
	Accepted: 'Вы не приняли {{ title || "соглашение" }}',
	ActiveUrl: url,
	After: 'Дата {{ title }} должна быть позже',
	Alpha: 'Поле {{ title }} может содержать только буквы',
	AlphaDash: 'Поле {{ title }} может содержать только буквы, цифры и дефис',
	AlphaNum: 'Поле {{ title }} может содержать только буквы и цифры',
	Array: 'Поле {{ title }} должно быть массивом',
	Before: 'Дата {{ title }} должна быть раньше',
	Between: ({ title, type, rule: { args } }) => compareFailed(type, title, `от ${args[0]} до ${args[1]}`),
	Boolean: 'Поле {{ title }} должно быть типа "Да" или "Нет"',
	Confirmed: 'Поле {{ title }} не совпадает с подтверждением',
	Date: 'Поле {{ title }} должно быть датой',
	DateFormat: 'Дата {{ title }} не соответствует формату [0]',
	Different: ({ title, rule: { args }, fields }) => `Поля ${title} и ${fields[args[0]] && fields[args[0]].title || 'unknown'} должны отличаться`,
	Digits: 'Поле {{ title }} должно содержать [0] цифр',
	DigitsBetween: 'Поле {{ title }} должно содержать от [0] до [1] цифр',
	Dimensions: 'Картинка {{ title }} имеет недопустимые размеры',
	Distinct: 'Поле {{ title }} содержит повторяющиеся значения',
	Email: 'Поле {{ title }} не похоже на email',
	File: 'Поле {{ title }} должно быть файлом',
	Filled: required,
	Exists: 'Недопустимое значение поля {{ title }}',
	Image: 'Поле {{ title }} должно быть картинкой',
	In: 'Выбранное значение в поле {{ title }} ошибочно',
	InArray: ({ title, rule: { args }, fields }) => `Поле ${title} должно содержать одно из значений поля ${fields[args[0]] && fields[args[0]].title || 'unknown'}`,
	Integer: 'Поле {{ title }} должно быть целым числом',
	Ip: 'Поле {{ title }} должно содержать IP адрес',
	Json: 'Поле {{ title }} должно быть JSON строкой',
	Max: ({ title, type, rule: { args } }) => compareFailed(type, title, `до ${args[0]}`),
	Mimes: mimes,
	Mimetypes: mimes,
	Min: ({ title, type, rule: { args } }) => compareFailed(type, title, `от ${args[0]}`),
	NotIn: 'Выбранное значение в поле {{ title }} ошибочно',
	Numeric: 'Поле {{ title }} должно быть числом',
	Present: 'Поле {{ title }} должно присутствовать',
	Regex: 'Поле {{ title }} не соответствует формату',
	Required: required,
	RequiredIf: required,
	RequiredUnless: required,
	RequiredWith: required,
	RequiredWithout: required,
	RequiredWithoutAll: required,
	Same: ({ title, rule: { args }, fields }) => `Поле ${title} должно совпадать с полем ${fields[args[0]] && fields[args[0]].title || 'unknown'}`,
	Size: ({ title, type, rule: { args } }) => compareFailed(type, title, args[0]),
	String: 'Поле {{ title }} должно быть строкой',
	Timezone: 'Поле {{ title }} должно содержать корректный часовой пояс',
	Unique: unique,
	UniqueString: unique,
	Uploaded: 'Ошибка при загрузке файла {{ title }}',
	Url: url
};