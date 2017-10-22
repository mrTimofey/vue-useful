import MasterComponent from './master';
const $modal = {
	open(name, props) {
		this._masterComponent.openModal(name, props);
	},
	close() {
		this._masterComponent.close();
	}
};

Object.defineProperty($modal, 'masterComponent', {
	set(comp) {
		if (process.env.NODE_ENV !== 'production')
			if (window && this._masterComponent)
				throw new Error('Vue modal plugin: there must only one modal instance (trying to create a second instance)');
		this._masterComponent = comp;
	},
	get() {
		return this._masterComponent;
	}
});

export { MasterComponent };
export default {
	install(Vue) {
		Vue.prototype.$modal = $modal;
	}
};