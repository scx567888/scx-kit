//以下为组件
//以下为指令
import {ScxContextMenuDirective, ScxDragDirective, ScxIcon} from './scx-kit.js';

const components = [ScxIcon];

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