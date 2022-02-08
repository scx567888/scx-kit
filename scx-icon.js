import './_scx-icon/index.css'
import {h} from "vue";

const ScxIcon = {
    name: 'scx-icon',
    props: {
        icon: {
            type: String,
            default: '',
            required: true
        }
    },
    setup(props) {
        return () => h("svg", {class: 'scx-icon'}, h('use', {href: '#scx-icon_' + props.icon}, []))
    }
};

export {ScxIcon}