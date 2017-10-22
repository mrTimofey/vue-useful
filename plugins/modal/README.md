How to use:

1) `import ModalPlugin from './modal'; Vue.use(ModalPlugin)`.
2) `import { MasterComponent } from './modal'` from the plugin and insert it inside your application template inside `body`.
3) Set `MasterComponent.components` with an object containing your modal window components.
4) Add styles for your modal overlay and modal window.
5) Use with `this.$modal.open(componentName, props)` and `this.$modal.close()` from any component within your application.