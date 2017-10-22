<script>
	function range(from, to) {
		let res = [];
		for (let i = from; i <= to; ++i) res.push(i);
		return res;
	}

	export default {
		name: 'Pager',
		props: {
			page: {
				type: Number,
				required: true
			},
			max: {
				type: Number,
				required: true
			},
			loading: {
				type: Boolean,
				default: false
			}
		},
		model: {
			prop: 'page',
			event: 'change'
		},
		computed: {
			noWindow() {
				return this.max < 8;
			},
			leftWindow() {
				if (this.page >= 5) return [1];
				return false;
			},
			currentWindow() {
				if (this.page < 3) return range(1, 3);
				else if (this.page < 5) return range(1, this.page + 1);
				else if (this.page > this.max - 2) return range(this.max - 2, this.max);
				else if (this.page > this.max - 4) return range(this.page - 1, this.max);
				else return range(this.page - 1, this.page + 1);
			},
			rightWindow() {
				if (this.page <= this.max - 4) return [this.max];
				return false;
			},
			hrefPrefix() {
				const href = this.$route.fullPath.replace(/([?&])page=[0-9]+&?/, '$1');
				if (href.endsWith('&') || href.endsWith('?')) return href;
				if (href.indexOf('?') === -1) return href + '?';
				return href + '&';
			}
		},
		methods: {
			change(page) {
				if (!this.loading) this.$emit('change', {page, href: this.href(page)});
			},
			href(page) {
				return page > 1 ? (this.hrefPrefix + 'page=' + page) : this.hrefPrefix.slice(0, -1);
			}
		}
	};
</script>
<template lang="pug">
	nav.pager(v-if="max > 1" ':class'="{ loading }")
		.prev
			a(@click.prevent="change(page - 1)" v-if!="page > 1" ':href'="href(page - 1)") Назад
			span(v-else) Назад
		.hidden.md-show-ib.current-display {{ page }} из {{ max }}
		ul.page-list.md-hidden
			template(v-if!="noWindow")
				li(v-for="i in max" ':class'="{ current: page === i }")
					span(v-if="i === page") {{ i }}
					a(v-else @click.prevent="change(i)" ':href'="href(i)") {{ i }}
			template(v-else)
				template(v-if="leftWindow")
					li(v-for="i in leftWindow" ':class'="{ current: page === i }")
						span(v-if="i === page") {{ i }}
						a(v-else @click.prevent="change(i)" ':href'="href(i)") {{ i }}
					li.dots ...
				li(v-for="i in currentWindow" ':class'="{ current: page === i }")
					span(v-if="i === page") {{ i }}
					a(v-else @click.prevent="change(i)" ':href'="href(i)") {{ i }}
				template(v-if="rightWindow")
					li.dots ...
					li(v-for="i in rightWindow" ':class'="{ current: page === i }")
						span(v-if="i === page") {{ i }}
						a(v-else @click.prevent="change(i)" ':href'="href(i)") {{ i }}
		.next
			a(@click.prevent="change(page + 1)" v-if="page !== max" ':href'="href(page + 1)") Вперёд
			span(v-else) Вперёд
</template>