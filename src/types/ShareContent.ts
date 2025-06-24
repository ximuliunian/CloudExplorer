// 分享内容
export default interface ShareContent {
    is_secret: boolean;  // 是否保密
    title: string;  // 标题
    summary?: string;    // 简介
    cover?: string;  // 图标
    file_url: FileUrl[];    // 文件下载链接
    description?: string[];   // 介绍
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