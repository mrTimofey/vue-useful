export default {
	props: {
		tag: String,
		innerTag: {
			type: String,
			default: 'div'
		},
		innerClass: {
			type: [String, Array],
			default: 'inner'
		}
	},
	data: () => ({
		comp: null,
		compProps: null,
		size: null
	}),
	methods: {
		openModal(name, props, size) {
			if (!name) throw new Error('Vue modal plugin: can not open undefined modal');
			this.size = typeof size === 'string' ? size : null;
			this.$emit('before-open', { comp: name, compProps: props });
			this.comp = name;
			this.compProps = props;
			this.$emit('opened', this.$data);
			return new Promise(resolve => {
				this.$once('closed', result => resolve(result));
			});
		},
		close(result) {
			this.$emit('before-close', this.$data);
			this.$nextTick(() => {
				this.comp = null;
				this.compProps = null;
				this.$emit('closed', result);
			});
		}
	},
	created() {
		this.clickInside = false;
		this.$modal.masterComponent = this;
	},
	render(h) {
		return this.comp && h(
			this.tag || this.$vnode.data.tag || 'div',
			{ on: {
				click: () => {
					if (this.clickInside) {
						this.clickInside = false;
						return;
					}
					this.close();
				}
			} },
			[
				this.$slots.before,
				h(
					this.innerTag,
					{
						class: this.innerClass,
						on: {
							click: () => {
								this.clickInside = true;
							}
						}
					},
					[
						this.$slots.innerBefore,
						// show modal component itself
						h(this.comp, { props: this.compProps }, this.$slots.default),
						this.$slots.innerAfter
					]
				),
				this.$slots.after
			]
		);
	},
	components: {}
};
