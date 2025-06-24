export default interface SearchList {
    name: string    // 搜索名称
    path: string    // 对应路径
    type: 'file' | 'dir'    // 类型
    is_secret?: boolean    // 是否为保密内容
    json_name?: string    // JSON 文件名
}