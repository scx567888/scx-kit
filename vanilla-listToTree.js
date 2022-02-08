/**
 * 将含有 id parentID 的 list 列表转换为树形结构
 * 这里将 parentID === 0 的设置为 第一层
 * list 格式要求 [{parentID:0, id:10}, {parentID:10, id:100}]
 */
function listToTree(source) {
    if (source.length === 0) {
        return []
    } else {
        let cloneData = JSON.parse(JSON.stringify(source));       // 对源数据深度克隆
        return cloneData.filter(father => {                      // 循环所有项，并添加 children 属性
            let branchArray = cloneData.filter(child => father.id === child.parentID);  // 返回每一项的子级数组
            if (branchArray.length > 0) {
                father.children = branchArray
            }
            return Number(father.parentID) === 0; // 返回第一层
        });
    }
}

export {listToTree}