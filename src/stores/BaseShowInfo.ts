import { getPath, getPathByName } from '@/api/pathApi';
import { getSearch, getSearchByName } from '@/api/searchApi';
import HandleRouter from '@/hooks/handle/HandleRouter';
import type { FileDetail } from '@/types/PathTree';
import type PathTree from '@/types/PathTree';
import type SearchList from '@/types/SearchList';
import { defineStore } from 'pinia';

interface FileDetailState {
    pathTreeInfo: PathTree; // 存储路径树
    pathTreeInfoBool: boolean; // 路径树信息是否初始化
    searchInfo: SearchList[]; // 存储搜索信息
    searchInfoBool: boolean; // 搜索信息是否初始化
}

export const useBaseShowInfoStore = defineStore('base_show_info', {
    state: (): FileDetailState => ({
        pathTreeInfo: {
            name: '根节点',
            children: [],
            files: [],
        },
        searchInfo: [],
        pathTreeInfoBool: false,
        searchInfoBool: false,
    }),

    getters: {
        // 通过地址栏获取当前的资源信息
        currentResourceInfo(state): FileDetail {
            const params = HandleRouter.getFileName();
            return state.searchInfo.find(item => item.name === params) as FileDetail;
        },
    },

    actions: {
        // 初始化路径数信息
        async initPathTreeInfo(md5?: string) {
            let data: PathTree;

            if (md5) {
                data = (await getPathByName(md5)).data
            } else {
                data = (await getPath()).data
            }

            this.pathTreeInfo.children = data.children || [];
            this.pathTreeInfo.files = data.files || [];
            this.pathTreeInfoBool = true;
        },

        // 初始化搜索信息
        async initSearchInfo(md5?: string) {
            let data: SearchList[];

            if (md5) {
                data = (await getSearchByName(md5)).data
            } else {
                data = (await getSearch()).data
            }

            this.searchInfo = data;
            this.searchInfoBool = true;
        },
    },
});

// 初始化系统展示信息
export const initBaseShowInfo = (md5?: string) => {
    const baseShowInfoStore = useBaseShowInfoStore();
    baseShowInfoStore.pathTreeInfoBool = false;
    baseShowInfoStore.searchInfoBool = false;
    baseShowInfoStore.initPathTreeInfo(md5);
    baseShowInfoStore.initSearchInfo(md5);
}
