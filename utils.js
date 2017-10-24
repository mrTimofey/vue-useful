import Vue from 'vue';

/**
 * String to camelCase
 * @param {string} str string to process
 * @param {boolean} [lowerFirst] lowercase first letter (uppercase by default)
 * @returns {string} processed string
 */
export function filenameToCamelCase(str, lowerFirst) {
	return str
	// remove extension
		.replace(/\.[a-z0-9]+$/i, '')
		// remove leading ./
		.replace(/^\.\//, '')
		// split by '-', '_', '/'
		.split(/[-_/]/)
		// remove empty pieces
		.filter(piece => piece.length)
		// capitalize each piece
		.map((el, i) => el.substr(0, 1)[(lowerFirst && i === 0) ? 'toLowerCase' : 'toUpperCase']() + el.substr(1))
		.join('');
}

/**
 * Require all modules from require.context, applies callback to each module or returns name => module mappings
 * if callback is omitted.
 * @param {Object} requireFile require.context call result
 * @param {Function} [cb]<{string} name, module> callback function, optional
 * @returns {Object|undefined} module name => module mapping or nothing if callback is omitted
 */
export function requireAll(requireFile, cb) {
	let modules;
	if (!cb) modules = {};
	for (let name of requireFile.keys()) {
		let module = requireFile(name);
		if (module.default) module = module.default;
		if (cb) cb(module, name);
		else modules[name] = module;
	}
	if (!cb) return modules;
}

/**
 * Returns a promise which will be resolved with provided async calls data. Useful with prefetch when you have to
 * fetch data from multiple sources and assign it to different keys within component data.
 * @param {Object} obj [key] => {promise, must be resoled with data that will be assigned to the key}
 * @returns {Promise} promise
 */
export function promiseMapAll(obj) {
	return new Promise((resolve, reject) => {
		Promise.all(Object.values(obj)).then(values => {
			const map = {},
				keys = Object.keys(obj);
			for (let i in keys) map[keys[i]] = values[i];
			resolve(map);
		}).catch(reject);
	});
}

/**
 * Try to convert anything to a Date object.
 * @param {*} str
 * @param {boolean} fixTimezone remove timezone offset from result
 * @returns {Date|null}
 */
export function convert2date(str, fixTimezone = true) {
	if (!str) return null;
	let date;
	// unix timestamp
	if (Number.isInteger(str) && str > 100000000 && str < 9999999999) date = new Date(str * 1000);
	// JavaScript ms timestamp
	else if (Number.isInteger(str) && str > 100000000000 && str < 9999999999999) date = new Date(str);
	// string
	else date = new Date(str.toString().split('-').join('/')) || null;

	if (!date) return null;

	// fix timezone
	if (fixTimezone) date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
	return date;
}

/**
 * Parse string with placeholders.
 * Replaces {{ field [| filter] [| filter(param, param)] [|| defaultValue] }}
 * @param {string} str string to process
 * @param {Object|Array} obj object or array of objects, data source for replacements
 * @param {string} def default value
 * @returns {string} processed string
 */
export function parsePlaceholders(str, obj, def = '') {
	// optimization
	if (str.indexOf('{{') >= str.indexOf('}}')) return str;
	/**
	 * parse substrings like {{ field [| filter1 | filter2(arg, arg) || default value] }}
	 * {{ - open placeholder
	 *      \s*
	 *      ([a-zA-Z_0-9]+) - get field name
	 *      \s*
	 *      ((\|\s*([a-zA-Z0-9()\s,]+?)\s*)*) - optional filters, a whole string is then processed ( | filter1 | filter2(arg, arg) )
	 *          \|\s*([a-zA-Z0-9()\s,]+?)\s* - single filter match
	 *      \s*
	 *      (\|\|\s*([^}]+?))? - optional default value ( || default value )
	 *      \s*
	 * }} - close placeholder
	 * @type {RegExp}
	 */
	const regex = /{{\s*([a-zA-Z_0-9]+)\s*((\|\s*([а-яА-Яa-zA-Z0-9()\s,]+?)\s*)*)\s*(\|\|\s*([^}]+?))?\s*}}/g;
	function applyFilters(v, filters) {
		if (!filters || !Vue.options.filters) return v;
		filters = filters.split('|');
		for (let filter of filters) {
			filter = filter.trim();
			if (!filter) continue;
			filter = filter[0].toUpperCase() + filter.substr(1);
			let split = filter.indexOf('(');
			// extract filter name and filter arguments
			if (split > -1) {
				let args = filter
				// remove trailing )
					.substring(split + 1, filter.length - 1)
					// get each argument
					.split(',')
					// trim and remove empty
					.map(arg => arg.trim()).filter(arg => arg);
				filter = filter.substr(0, split);
				v = Vue.options.filters[filter] ? Vue.options.filters[filter].apply(null, [v, ...args]) : v;
			}
			else v = Vue.options.filters[filter] ? Vue.options.filters[filter].call(null, v) : v;
		}
		return v;
	}
	return str.replace(regex, (_, field, filters, f1, f2, f3, localDef) => {
		if (Array.isArray(obj)) {
			const ar = obj.filter(ar => ar);
			for (let item of ar) if (item[field]) return applyFilters(item[field], filters);
			return localDef || def;
		}
		return obj[field] && applyFilters(obj[field], filters) || localDef || def;
	});
}

/**
 * Parse error message.
 * @param {string} message input
 * @param {Object} args placeholder arguments
 * @returns {string} processed message
 */
export function parseErrorMessage(message, args) {
	return parsePlaceholders(message, args)
		// replace [index] with rule args (example: Between: [3, 10], replacements are [0] -> 3, [1] -> 10)
		.replace(/\[([0-9]+)]/g, (_, index) => args.rule.args[parseInt(index)]);
}

/**
 * Convert error data to human readable data.
 * @param {Object} rules error response data from a Laravel backend
 * @param {Object} options fields data
 * @param {Object} validationMessages validation human readable message templates
 * @returns {Object} object with error messages
 */
export function formatValidationErrors(rules, options, validationMessages) {
	const output = {},
		fields = options && options.fields || {};
	// fill all fields with data if needed { name, title, type }
	for (let name of Object.keys(fields)) {
		if (!fields[name].title) fields[name].title = name;
		if (!fields[name].type) fields[name].type = 'text';
	}
	// go through all errors { fieldName: { Rule1: [arg1, arg2], Rule2: [], ... }, ... }
	for (let name of Object.keys(rules)) {
		const
			// rewrite default messages with custom ones
			customMessages = options && options.messages && options.messages[name],
			// check field existence and create a default one if needed
			field = fields[name] || { name, title: name, type: 'text' },
			// args are passed to error message function or when parsing a message string
			args = { ...field, rules, fields };
		// if custom message is a simple string - just use it
		if (typeof customMessages === 'string') output[name] = customMessages;
		// if custom message is a function - call it against the args
		else if (typeof customMessages === 'function') output[name] = customMessages(args);
		else {
			// generate messages for each rule error
			let messages = {};
			for (let ruleName of Object.keys(rules[name])) {
				const
					// get rewritten rule or default one
					message = customMessages && customMessages[ruleName] || validationMessages[ruleName],
					rule = { args: rules[name][ruleName] },
					// add this rule data to the args
					messageArgs = { ...args, rule };
				if (message)
					messages[ruleName] = typeof message === 'function' ?
						message(messageArgs) : parseErrorMessage(message, messageArgs);
				// unknown rule
				else messages[rule] = `[${ruleName}(${rule.args.join(', ')})]`;
			}
			output[name] = messages;
		}
	}
	return output;
}

/**
 * Convert error response to human readable data.
 * @param {Object} res Axios response object
 * @param {Object} options fields data
 * @param {Object} validationMessages validation human readable message templates
 * @returns {Object} object with error messages
 */
export function formatValidationResponse(res, options, validationMessages) {
	return formatValidationErrors(res.data, options, validationMessages);
}

const pluralizeCases = [2, 0, 1, 1, 1, 2];
/**
 * Returns pluralized string based on number and provided strings array.
 * @param {number} number count
 * @param {Array.<string>} titles ['человек', 'человека', 'человек']
 * @returns {string} pluralized string
 */
export function pluralize(number, titles) {
	if (titles.length === 2) titles.push(titles[1]);
	number = parseInt(number) || 0;
	if (number % 1) return titles[1];
	return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : pluralizeCases[(number % 10 < 5) ? number % 10 : 5]];
}

export function isEnterKeyEvent(e) {
	return e.keyCode === 10 || e.which === 10
		|| e.keyCode === 13 || e.which === 13
		|| e.code === 'Enter' || e.key === 'Enter';
}

const scriptMap = {};
/**
 * Load script and resolve a promise after script is loaded
 * @param {string} src script src
 * @returns {Promise} script loading promise
 */
export function loadScript(src) {
	if (!scriptMap[src]) scriptMap[src] = new Promise((resolve, reject) => {
		let script = document.createElement('script');
		script.async = true;
		script.src = src;
		script.onload = () => {
			script.dataset.loaded = true;
			resolve();
		};
		script.onerror = () => {
			script.dataset.loaded = false;
			reject();
		};
		document.head.appendChild(script);
	});
	return scriptMap[src];
}

/**
 * Remove all tags from a string.
 * @param {string} str source
 * @returns {string} result
 */
export function stripTags(str) {
	return str.replace(/<\/?[^>]+>/gi, '');
}

/**
 * Remove all tags and escape symbols from string.
 * @param {string} str source
 * @returns {string} result
 */
export function html2text(str) {
	return str ? stripTags(str).replace(/&\w+;\s*/g, ' ') : '';
}

export function pad(str, length = 2, char = '0') {
	if (!str) str = '';
	else str = str.toString();
	return str.length >= length ? str : (new Array(length - str.length + 1).join(char) + str);
}