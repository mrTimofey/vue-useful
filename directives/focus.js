export default window ? {
	inserted(el, binding) {
		if (binding.value || !binding.hasOwnProperty('value')) setTimeout(() => {
			let target = el.querySelector('input, textarea, select, [tabindex]');
			(target || el).focus();
		}, 300);
	}
// eslint-disable-next-line no-empty-function
} : () => {};