import ScxIcon from './scx-icon/index.vue'
import ScxCrud from './scx-crud/index.vue'
import ScxGroup from './scx-group/index.vue'
import ScxUpload from './scx-upload/index.vue'
import ScxUploadList from './scx-upload-list/index.vue'
import ScxProgress from './scx-progress/index.vue'
import {closeContextMenu, ScxContextMenuDirective, showContextMenu} from "./scx-context-menu/index.js";
import {ScxDragDirective} from "./scx-drag/index.js";

//以下为组件
const components = [ScxIcon, ScxCrud, ScxGroup, ScxUpload, ScxUploadList, ScxProgress];

//以下为指令
const directives = [ScxContextMenuDirective, ScxDragDirective];

const ScxComponent = {
    install: (app) => {
        //安装组件
        components.forEach(c => app.component(c.name, c));
        //安装指令
        directives.forEach(d => app.directive(d.name, d));
    }
};

export {
    showContextMenu,
    closeContextMenu,
    ScxIcon,
    ScxCrud,
    ScxGroup,
    ScxUpload,
    ScxUploadList,
    ScxComponent
}