import request from "@/utils/request";

// 获取路径
export function getPath() {
    return request({
        url: '/path.json',
        method: 'get'
    })
}

// 获取隐藏路径
export function getPathByName(name: string) {
    return request({
        url: `/${name}_path.json`,
        method: 'get'
    })
}
