import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter, type RouteLocationNormalizedLoadedGeneric, type Router } from "vue-router";

// 路由信息
const router = ref<Router>()
const route = ref<RouteLocationNormalizedLoadedGeneric>()

const getRoute = () => { return route.value }
const getRouter = () => { return router.value }

type pathChangeType = (result: string[], newOath: string | undefined, oldPath: string | undefined) => void;   // 回调函数类型

// 地址栏更改回调函数列表
const pathChangeCallbackList = reactive<pathChangeType[]>([])

/**
 * 注册 地址栏更改 事件函数
 * @param fun 地址栏更改 函数
 */
watch(() => getRoute()?.path, (newData, oldData) => {
    // 如果地址栏没有更改，则不执行回调函数
    if (newData === oldData) return
    pathChangeCallbackList.forEach((callback) => {
        const pathList = getRoute()?.params.urlParams as string[]
        callback(
            pathList ? pathList : [],
            newData, oldData
        )
    })
});

/**
 * 注册 地址栏更改 回调函数
 * @param callback 回调函数
 */
function registerPathChangeCallback(callback: pathChangeType) { pathChangeCallbackList.push(callback) }

// 获取地址栏参数
const getUrlParams = () => { return route.value?.params.urlParams as string[] }


/**
 * 初始化 函数
 */
const init = () => {
    onMounted(() => {
        route.value = useRoute()   // 获取路由信息
        router.value = useRouter()    // 获取路由对象
    })
}

export default {
    init,
    registerPathChangeCallback,
    getUrlParams,
}