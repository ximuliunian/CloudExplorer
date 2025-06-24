import CryptoJS from 'crypto-js';

export class Md5Util {
    // 计算字符串的 MD5 哈希值（32位小写MD5字符串）
    static compute(content: string): string {
        return CryptoJS.MD5(content).toString(CryptoJS.enc.Hex);
    }

    // 计算字符串的 MD5 哈希值（32位大写MD5字符串）
    static computeUpperCase(content: string): string {
        return this.compute(content).toUpperCase();
    }
}
