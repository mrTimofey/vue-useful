import http from 'axios';
import { formatValidationResponse } from '../../utils';
import validationMessages from './ru';

export default {
	data: () => ({
		errors: {},
		sending: false,
		sent: false
		// fields: [{ name, type, value, title }]
		// action: 'url'
		// [messages]: custom error messages
	}),
	computed: {
		valid() {
			return Object.keys(this.errors).length === 0;
		},
		fieldMap() {
			const data = {};
			for (let f of this.fields) data[f.name] = f;
			return data;
		},
		fieldValues() {
			const data = {};
			for (let f of this.fields) data[f.name] = f.value;
			return data;
		},
		formData() {
			return this.fieldValues;
		}
	},
	methods: {
		// onSuccess(res)
		// onError(err)
		// validate()
		send() {
			if (this.sending) return;
			this.errors = {};
			if (this.validate) this.validate();
			if (!this.valid) return;
			this.sending = true;
			http.post(this.action, this.formData)
				.then(res => {
					this.sent = true;
					if (this.onSuccess) this.onSuccess(res);
				})
				.catch(err => {
					if (!err.response) throw err;
					if (err.response && err.response.status === 422)
						this.errors = formatValidationResponse(
							err.response,
							{ fields: this.fieldMap, messages: this.messages },
							validationMessages
						);
					if (this.onError) this.onError(err);
				})
				.then(() => { this.sending = false; });
		}
	}
};