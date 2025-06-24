import request from "@/utils/request";

// 获取背景图
export default () => {
    return request({
        url: `/image/background/index.json`,
        method: 'get',
        baseURL: '/'
    })
}