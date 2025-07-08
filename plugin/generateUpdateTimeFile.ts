import { Md5Util } from '../src/utils/Md5Util';
import type UpdateTimeData from '../src/types/UpdateTimeData';
import { apiDir, BaseInterface, writeFile, secretKey } from "./indexPlugin";
import * as fs from "fs";
import * as path from "path";

// 定义类型接口
interface GUTF extends BaseInterface {
    file_name: string;
    getMd5: () => string | null;
}

// 初始化为 {} 并使用类型断言
let gutf: GUTF = {} as GUTF;


gutf.file_name = "update_time.json";

gutf.init = () => {
    // 准备内容数据
    const time = new Date().getTime()
    const key = Md5Util.compute(`${time}#${secretKey}`)
    let utd: UpdateTimeData = {
        updateId: Md5Util.compute(`${time}#${key}`),
        updateTime: time,
    }
    console.log(`KEY：${time}#${secretKey}`);
    writeFile(apiDir.root, gutf.file_name, utd)
}

// 获取文件路径值
gutf.getMd5 = () => {
    const filePath = path.resolve(apiDir.root, gutf.file_name);
    const fileContent = JSON.parse(fs.readFileSync(filePath, "utf8")) as UpdateTimeData;

    /*
     * 通过设置的密钥在加上通过时间戳和密钥生成的MD5值生成的MD5密钥作为加密文件夹名
     * 这样在前端判断只有密钥输入正确那么才会得到加密文件夹名
     */
    const key = Md5Util.compute(`${fileContent.updateTime}#${secretKey}`)
    return Md5Util.compute(`${fileContent.updateId}#${key}`)
};

export default gutf;