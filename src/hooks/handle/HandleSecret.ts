// 处理秘籍相关

import { getUpdateTimeFile } from "@/api/filesApi";
import type UpdateTimeData from "@/types/UpdateTimeData";
import { CookieUtil } from "@/utils/CookieUtil";
import { Md5Util } from "@/utils/Md5Util";
import { onMounted, reactive } from "vue";

// 回调函数类型
type checkSuccessCallback = (result: string) => void;

// 密集验证成功后回调函数列表
interface CheckSuccessInfo {
    name: string,
    callback: checkSuccessCallback
}
const checkSuccessCallbackList = reactive<CheckSuccessInfo[]>([])

// 更新数据
let updateData = reactive<UpdateTimeData>({} as UpdateTimeData)

// 检查是否已经验证过了
const checked = reactive({
    isChecked: false, // 是否已经验证过了
    checkResult: false, // 验证结果
    md5: '',    // 验证结果的 md5 值
})

/**
 * 获取验证结果的 md5 值
 * @returns md5 值
 */
const getMd5 = () => {
    return checked.md5
}

/**
 * 判断是否已经验证过了
 * @returns 是否已经验证过了
 */
const isChecked = () => {
    return checked.isChecked
}

/**
 * 注册校验成功回调函数
 * 
 * @param callback 回调函数
 */
function registerCheckSuccessCallback(name: string, callback: checkSuccessCallback) {
    // 如果存在名称相同的回调函数先删除已存在的回调函数
    const index = checkSuccessCallbackList.findIndex(item => item.name === name)
    if (index !== -1) {
        checkSuccessCallbackList.splice(index, 1)
    }

    // 注册回调函数
    checkSuccessCallbackList.push({ name, callback })

    // 如果已经验证过了，则判断一下是否够通过验证，如果通过验证，则直接调用回调函数
    if (checked.checkResult) {
        callback(checked.md5)
    }
}

// 更新数据加载状态
let updateDataReady: Promise<void> | null = null

/**
 * 加载更新时间数据
 */
const loadUpdateData = async () => {
    try {
        const data = (await getUpdateTimeFile()).data as UpdateTimeData;
        updateData.updateId = data.updateId
        updateData.updateTime = data.updateTime
    } catch (error) {
        console.error('秘笈配置加载失败:', error)
        checked.isChecked = true;   // 加载失败时不阻塞其余页面
        return
    }

    // 获取存储在 cookie 中的 secret 值，如果为空则不执行
    const secret = CookieUtil.getCookie('secret')
    if (!secret) {
        checked.isChecked = true;
        return;
    }

    // 判断秘籍是否正确
    const updateId = Md5Util.compute(`${updateData.updateTime}#${secret}`)
    const isChecked = updateData.updateId === updateId
    checked.checkResult = isChecked;    // 存储验证结果
    if (!isChecked) {
        checked.isChecked = true;   // 设置状态为已验证
        return
    };

    // 走到这一步说明秘籍正确，则修改 checked 的状态和调用回调函数
    const resultMd5 = Md5Util.compute(`${updateData.updateId}#${secret}`)
    checked.md5 = resultMd5;
    checkSuccessCallbackList.forEach(callback => {
        try {
            callback.callback(resultMd5)
        } catch (error) {
            console.error(`秘笈校验回调 ${callback.name} 执行失败:`, error)
        }
    })
    checked.isChecked = true;   // 设置状态为已验证
}

/**
 * 秘笈 - 初始化
 */
const init = () => {
    onMounted(() => {
        updateDataReady = loadUpdateData()
    })
}

// 手动验证秘籍
const checkSecret = async (secret: string) => {
    // 等待配置加载完成，避免使用空数据计算 MD5
    if (updateDataReady) await updateDataReady
    if (!updateData.updateId) return

    const key = Md5Util.compute(`${updateData.updateTime}#${secret}`)
    const updateId = Md5Util.compute(`${updateData.updateTime}#${key}`)
    if (updateData.updateId !== updateId) return;
    CookieUtil.setCookie('secret', key, Number(import.meta.env.SECRET_EXPIRES))
    const md5 = Md5Util.compute(`${updateData.updateId}#${key}`)
    checked.md5 = md5;
    checked.checkResult = true;
    checked.isChecked = true;
    checkSuccessCallbackList.forEach(callback => {
        try {
            callback.callback(md5)
        } catch (error) {
            console.error(`秘笈校验回调 ${callback.name} 执行失败:`, error)
        }
    })
}

export default {
    init,
    registerCheckSuccessCallback,
    checkSecret,
    getMd5,
    isChecked,
}

