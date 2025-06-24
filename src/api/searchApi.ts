import request from "@/utils/request";

// 获取搜索索引
export function getSearch() {
    return request({
        url: '/search.json',
        method: 'get'
    })
}

// 获取隐藏搜索索引
export function getSearchByName(name: string) {
    return request({
        url: `/${name}_search.json`,
        method: 'get'
    })
}
