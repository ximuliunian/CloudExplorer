// 路径树
export default interface PathTree {
    name: string;  // 路径名
    files: FileDetail[];  // 子文件
    children: PathTree[];  // 子路径 
}

// 文件详情
export interface FileDetail {
    name: string;  // 文件名
    type: 'file' | 'url';  // 类型
    is_secret?: boolean;  // 是否为保密内容
    json_name: string;  // JSON 文件名（当 type 为 url 时内容为 URL）
}