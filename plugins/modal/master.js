let clickInside = false;

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
		compProps: null
	}),
	methods: {
		openModal(name, props) {
			if (!name) throw new Error('Vue modal plugin: can not open undefined modal');
			this.$emit('before-open', { comp: name, compProps: props });
			this.comp = name;
			this.compProps = props;
			this.$emit('opened', this.$data);
			return new Promise(resolve => {
				this.$once('before-close', data => resolve(data));
			});
		},
		close() {
			if (clickInside) {
				clickInside = false;
				return;
			}
			this.$emit('before-close', this.$data);
			this.comp = null;
			this.compProps = null;
			this.$emit('closed');
		}
	},
	created() {
		this.$modal.masterComponent = this;
	},
	render(h) {
		return this.comp && h(
			this.tag || this.$vnode.data.tag || 'div',
			{
				class: 'modal-' + this.comp,
				on: { click: this.close }
			},
			[
				this.$slots.before,
				h(
					this.innerTag,
					{
						class: this.innerClass,
						on: {
							click() { clickInside = true; }
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