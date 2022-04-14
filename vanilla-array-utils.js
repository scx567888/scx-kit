/**
 * 根据 索引 从数组中移除 项
 * @param list
 * @param index
 */
function removeByIndex(list, index) {
    list.splice(index, 1);
}

/**
 * 根据 索引 从数组中上移 项
 * @param list
 * @param index
 */
function moveUpByIndex(list, index) {
    if (index - 1 >= 0) {
        const temp = list[index];
        list[index] = list[index - 1];
        list[index - 1] = temp;
    }
}

/**
 * 根据 索引 从数组中下移 项
 * @param list
 * @param index
 */
function moveDownByIndex(list, index) {
    if (index + 1 <= list.length) {
        const temp = list[index];
        list[index] = list[index + 1];
        list[index + 1] = temp;
    }
}

/**
 * 根据 项 从数组中移除 项
 * @param list
 * @param item
 */
function removeByItem(list, item) {
    removeByIndex(list, list.indexOf(item))
}

/**
 * 根据 项 从数组中上移 项
 * @param list
 * @param item
 */
function moveUpByItem(list, item) {
    moveUpByIndex(list, list.indexOf(item))
}

/**
 * 根据 项 从数组中下移 项
 * @param list
 * @param item
 */
function moveDownByItem(list, item) {
    moveDownByIndex(list, list.indexOf(item))
}

export {
    removeByIndex, moveUpByIndex, moveDownByIndex, removeByItem, moveUpByItem, moveDownByItem
}