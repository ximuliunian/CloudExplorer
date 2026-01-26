import { onMounted, reactive, ref, watch } from "vue";
import {
  useRoute,
  useRouter,
  type RouteLocationNormalizedLoadedGeneric,
  type Router,
} from "vue-router";

// 路由信息
const router = ref<Router>();
const route = ref<RouteLocationNormalizedLoadedGeneric>();

const getRoute = () => {
  return route.value;
};
const getRouter = () => {
  return router.value;
};

// 回调函数类型
type pathChangeType = (
  result: string[],
  newOath: string | undefined,
  oldPath: string | undefined,
) => void | Promise<void>; // 回调函数类型

// 地址栏更改回调函数列表
const pathChangeCallbackList = reactive<pathChangeType[]>([]);

/**
 * 注册 地址栏更改 事件函数
 * @param fun 地址栏更改 函数
 */
watch(
  () => getRoute()?.path,
  (newData, oldData) => {
    // 如果地址栏没有更改，则不执行回调函数
    if (newData === oldData) return;
    pathChangeCallbackList.forEach((callback) => {
      const pathList: string[] = decodeURIComponent(newData || "")
        .split("/")
        .filter((item) => item !== "");
      callback(pathList ? pathList : [], newData, oldData);
    });
  },
);

/**
 * 注册 地址栏更改 回调函数
 * @param callback 回调函数
 */
function registerPathChangeCallback(callback: pathChangeType) {
  pathChangeCallbackList.push(callback);
}

/**
 * 获取地址栏路径参数
 * @returns 参数列表
 */
const getUrlParams = (): string[] => {
  return route.value?.params.urlParams as string[];
};

/**
 * 获取地址栏文件名
 * @returns 文件名
 */
const getFileName = (): string => {
  return route.value?.params.fileName as string;
}

/**
 * 路由 - 初始化
 */
const init = () => {
  onMounted(() => {
    route.value = useRoute(); // 获取路由信息
    router.value = useRouter(); // 获取路由对象
  });
};

export default {
  init,
  registerPathChangeCallback,
  getUrlParams,
  getFileName,
};
