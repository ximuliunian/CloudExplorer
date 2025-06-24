// cookie工具类
export class CookieUtil {
    /**
     * 设置 cookie
     * @param name 名称
     * @param value 值
     * @param days 有效天数
     */
    static setCookie(name: string, value: string, days: number) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        let expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + "; " + expires;
    }

    /**
     * 获取 cookie
     * @param name 名称
     * @returns 值
     */
    static getCookie(name: string): string | null {
        const cookieList = document.cookie.split('; ')

        for (const cookie of cookieList) {
            const c = cookie.split('=');
            if (c[0] === name) {
                return c[1];
            }
        }

        return null;
    }
}