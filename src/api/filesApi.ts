import request from "@/utils/request";

// 获取更细文件
export function getUpdateTimeFile() {
    return request({
        url: `/update_time.json`,
        method: 'get'
    })
}

// 获取免责声明文件
export function getDisclaimerFile() {
    return request({
        url: `/disclaimer.md`,
        baseURL:'/',
        method: 'get'
    })
}

// 获取普通文件
export function getFile(fileName: string) {
    return request({
        url: `/${fileName}`,
        method: 'get'
    })
}

// 获取加密文件夹中文件
export function getSecretFile(fileName: string, secretKey: string) {
    return request({
        url: `/${secretKey}/${fileName}`,
        method: 'get'
    })
}