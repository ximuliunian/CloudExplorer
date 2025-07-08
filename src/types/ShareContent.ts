// 分享内容
export default interface ShareContent {
    is_secret: boolean;  // 是否保密
    type: 'file' | 'url';  // 类型
    title: string;  // 标题
    cover?: string;  // 图标
    summary?: string;    // 简介
    description?: string[];   // 介绍
    file_url?: FileUrl[];    // 文件下载链接 - 仅在 type 为 file 时有效
    url?: string;  // 具体链接 - 仅在 type 为 url 时有效
}

// 链接列表
export interface FileUrl {
    title: string; // 标题
    content: Content[];  // 内容
}

// 具体链接
export interface Content {
    name: string;   // 链接名称
    url: string;    // 链接地址 
}