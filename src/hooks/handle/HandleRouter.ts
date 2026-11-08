import { reactive, ref, watch } from "vue";
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
      try {
        callback.callback(pathList, newData, oldData);
      } catch (error) {
        console.error(`路由回调 ${callback.name} 执行失败:`, error);
      }
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
 * 注销 地址栏更改 回调函数
 * @param name 回调函数名称
 */
function unregisterPathChangeCallback(name: string) {
  const index = pathChangeCallbackList.findIndex(item => item.name === name)
  if (index !== -1) {
    pathChangeCallbackList.splice(index, 1)
  }
}

/**
 * 获取地址栏路径参数
 * @returns 参数列表
 */
const getUrlParams = (): string[] => {
  const params = route.value?.params.urlParams;
  // 可重复参数在没有任何匹配时会返回空字符串，统一归一化为数组，避免调用方展开后得到字符
  if (Array.isArray(params)) return params as string[];
  if (typeof params === "string" && params !== "") {
    return params.split("/").filter((item) => item !== "");
  }
  return [];
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
  // 在 setup 阶段同步获取路由，避免子组件先于 onMounted 读取到空路由信息
  route.value = useRoute(); // 获取路由信息
  router.value = useRouter(); // 获取路由对象
};

export default {
  init,
  registerPathChangeCallback,
  unregisterPathChangeCallback,
  getUrlParams,
  getFileName,
  getRoute,
};
