/**
 * 将含有 id parentID 的 list 列表转换为树形结构
 * 这里将 parentID 为 null 或 undefined 的设置为 第一层
 * list 格式要求 [{parentID:null, id:10}, {parentID:10, id:100}]
 */
function listToTree(source, rawOptions = {}) {
    const {
        idFieldName = "id", // id FieId 的名称 默认为 'id'
        parentIDFieldName = "parentID", // parentID FieId 的名称 默认为 'parentID'
        childrenFieldName = "children", // children FieId 的名称 默认为 'children'
        ignoreOrphans = false // 是否忽略孤儿节点
    } = rawOptions;
    //只处理数组结构
    if (source && Array.isArray(source)) {
        let cloneData = JSON.parse(JSON.stringify(source));  // 对源数据深度克隆
        return cloneData.filter(father => {                      // 循环所有项，并添加 children 属性
            const fatherID = father[idFieldName]; //父 id
            const grandpaID = father[parentIDFieldName]; //爷爷 id
            //判断是否为孤儿 , 如果查询不到他的父级节点 那么他就是孤儿
            let isOrphan = false;
            if (!ignoreOrphans) {
                isOrphan = cloneData.filter(child => grandpaID === child[idFieldName]).length === 0;  // 返回每一项的子级数组
            }
            if (fatherID) {
                let fatherChildren = cloneData.filter(child => fatherID === child[parentIDFieldName]);  // 返回每一项的子级数组
                if (fatherChildren.length > 0) {
                    father[childrenFieldName] = fatherChildren;
                }
            }
            const fatherFatherID = father[parentIDFieldName];
            //最顶级节点为 父节点为空 或 孤儿
            return fatherFatherID === null || fatherFatherID === undefined || isOrphan;
        });
    } else {
        console.warn("listToTree : 数据为空或数据格式有误 (正确情况应为 Array) !!!")
        return [];
    }

}

export {listToTree}