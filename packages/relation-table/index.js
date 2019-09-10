

import RelationTable from './src/relation-table.vue'

// 为组件添加 install 方法，用于按需引入
RelationTable.install = function (Vue) {
    Vue.component(RelationTable.name, RelationTable)
}

export default RelationTable