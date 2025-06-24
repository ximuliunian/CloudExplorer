import type { FileDetail } from '@/types/PathTree';
import { defineStore } from 'pinia';

interface FileDetailState {
    fileDetails: FileDetail | null; // 存储文件详细信息
    currentFileId: string[] | null,   // 存储当前文件 ID
    showDetailPage: boolean;    // 控制是否显示详细信息页面
}
export const useFileInfoStore = defineStore('file_info', {
    state: (): FileDetailState => ({
        fileDetails: null,
        currentFileId: null,
        showDetailPage: false
    }),
    getters: {},
    actions: {
        setFileDetails(id: string[], details: FileDetail) {
            this.currentFileId = id;
            this.fileDetails = details;
            this.showDetailPage = true;
        },
        resetFileDetails() {
            this.currentFileId = null;
            this.fileDetails = null;
            this.showDetailPage = false;
        },
    },
});
