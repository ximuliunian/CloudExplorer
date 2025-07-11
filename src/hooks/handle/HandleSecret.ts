// 处理秘籍相关

import { getUpdateTimeFile } from "@/api/filesApi";
import type UpdateTimeData from "@/types/UpdateTimeData";
import { CookieUtil } from "@/utils/CookieUtil";
import { Md5Util } from "@/utils/Md5Util";
import { onMounted, reactive } from "vue";

// 回调函数类型
type checkSuccessCallback = (result: string) => void;
type checkCallback = (checkResult: boolean) => void;

// 密集验证成功后回调函数列表
const checkSuccessCallbackList = reactive<checkSuccessCallback[]>([])
// 密集验证后的回调函数列表
const checkCallbackList = reactive<checkCallback[]>([])

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
 * 注册校验成功回调函数
 * 
 * @param callback 回调函数
 */
function registerCheckSuccessCallback(callback: checkSuccessCallback) {
    // 注册回调函数
    checkSuccessCallbackList.push(callback)

    // 如果已经验证过了，则判断一下是否够通过验证，如果通过验证，则直接调用回调函数
    if (checked.checkResult) {
        callback(checked.md5)
    }
}

/**
 * 注册校验回调函数
 *
 * @param callback 回调函数
 */
function registerCheckCallback(callback: checkCallback) {
    // 注册回调函数
    checkCallbackList.push(callback)
    // 如果已经验证过了，则判断一下是否够通过验证
    if (checked.isChecked) {
        callback(checked.checkResult)
    }
}

/**
 * 初始化
 */
const init = () => {
    onMounted(async () => {
        // 更新数据
        const data = (await getUpdateTimeFile()).data as UpdateTimeData;
        updateData.updateId = data.updateId
        updateData.updateTime = data.updateTime

        // 获取存储在 cookie 中的 secret 值，如果为空则不执行
        const secret = CookieUtil.getCookie('secret')
        if (!secret) {
            checked.isChecked = true;
            checkCallbackList.forEach(callback => callback(false))
            return;
        }

        // 判断秘籍是否正确
        const updateId = Md5Util.compute(`${updateData.updateTime}#${secret}`)
        const isChecked = updateData.updateId === updateId
        checked.checkResult = isChecked;    // 存储验证结果
        checked.isChecked = true;   // 设置状态为已验证
        checkCallbackList.forEach(callback => callback(isChecked))
        if (!isChecked) return;

        // 走到这一步说明秘籍正确，则修改 checked 的状态和调用回调函数
        const resultMd5 = Md5Util.compute(`${updateData.updateId}#${secret}`)
        checked.md5 = resultMd5;
        checkSuccessCallbackList.forEach(callback => callback(resultMd5))
    })
}

// 手动验证秘籍
const checkSecret = (secret: string) => {
    const key = Md5Util.compute(`${updateData.updateTime}#${secret}`)
    const updateId = Md5Util.compute(`${updateData.updateTime}#${key}`)
    if (updateData.updateId !== updateId) return;
    CookieUtil.setCookie('secret', key, Number(import.meta.env.SECRET_EXPIRES))
    checkSuccessCallbackList.forEach(callback => callback(Md5Util.compute(`${updateData.updateId}#${key}`)))
}

export default {
    init,
    registerCheckSuccessCallback,
    registerCheckCallback,
    checkSecret,
    getMd5
}

