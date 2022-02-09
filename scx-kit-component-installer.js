import {ScxContextMenuDirective, ScxCrud, ScxDragDirective, ScxGroup, ScxIcon} from './scx-kit.js';

//以下为组件
const components = [ScxIcon, ScxCrud, ScxGroup];

//以下为指令
const directives = [ScxContextMenuDirective, ScxDragDirective];

const ScxKitComponentInstaller = {
    install: (app) => {
        //安装组件
        components.forEach(c => app.component(c.name, c));
        //安装指令
        directives.forEach(d => app.directive(d.name, d));
    }
};

export {
    ScxKitComponentInstaller
}