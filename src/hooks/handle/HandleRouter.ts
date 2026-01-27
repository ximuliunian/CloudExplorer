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

/**
 * 地址栏更改回调函数信息
 */
interface PathChangeInfo {
  name: string;
  callback: pathChangeType;
}

// 地址栏更改回调函数列表
const pathChangeCallbackList = reactive<PathChangeInfo[]>([]);

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
      callback.callback(pathList ? pathList : [], newData, oldData);
    });
  },
);

/**
 * 注册 地址栏更改 回调函数
 * @param callback 回调函数
 */
function registerPathChangeCallback(name: string, callback: pathChangeType) {
  // 如果存在名称相同的回调函数先删除已存在的回调函数
  const index = pathChangeCallbackList.findIndex(item => item.name === name)
  if (index !== -1) {
    pathChangeCallbackList.splice(index, 1)
  }
  // 注册回调函数
  pathChangeCallbackList.push({ name, callback });
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
