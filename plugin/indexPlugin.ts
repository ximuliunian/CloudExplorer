import fs from 'fs';
import path from 'path';
import gutf from './generateUpdateTimeFile';
import gp from './generatePath';
import ShareContent from '../src/types/ShareContent';

export let secretKey: string;

// API 生成目录
export enum apiDirPath {
    root = '../dist/api', // 根目录
    rootDev = '../../public/api'   // 根目录 - 开发阶段
}

// API 生成目录对象
export let apiDir = {
    // 根目录
    root: path.resolve(__dirname, apiDirPath.root)
}

// 定义类型接口
export interface BaseInterface {
    init: () => void;
}

// 生成静态文件的逻辑
function generateStaticFiles() {
    // 确保输出目录存在
    existsDir();

    // 初始化更新时间
    gutf.init();

    // 生成路径
    gp.init();
}

// 更新 ApiDir 状态
function updateApiDir(mode: string) {
    apiDir.root = path.resolve(__dirname, mode === 'development' ? apiDirPath.rootDev : apiDirPath.root);
}

export default (secret: string) => {
    secretKey = secret
    return {
        name: 'vite-plugin-generate-json',

        // 配置阶段更新 ApiDir 状态
        config(config: any, env: any) {
            updateApiDir(env.mode);
            const apiPath = path.resolve(__dirname, apiDirPath.rootDev);

            // 仅在开发模式首次启动时生成
            if (env.mode === 'development' && !process.env.__VITE_INITIALIZED__) {
                if (fs.existsSync(apiPath)) {
                    fs.rmSync(apiPath, { recursive: true, force: true });
                }

                generateStaticFiles();
                process.env.__VITE_INITIALIZED__ = 'true';
            }

            // 打包阶段删除 apiDirPath.rootDev 目录
            if (env.mode === 'production') {
                if (fs.existsSync(apiPath)) {
                    fs.rmSync(apiPath, { recursive: true, force: true });
                }
            }
        },

        // 开发阶段监听文件变化并重新生成文件
        configureServer(server: any) {
            // 开发阶段监听文件变化并重新生成文件
            const sourceDir = path.resolve(__dirname, '../../source');
            server.watcher.on('all', (event: any, filePath: any) => {
                if (filePath.startsWith(sourceDir) && filePath.endsWith('.json')) {
                    generateStaticFiles();
                }
            });
        },

        // 打包阶段生成静态文件
        closeBundle() {
            if (process.env.NODE_ENV === 'production') {
                generateStaticFiles();
            }
        }
    };
}

// 查找文件类型
export enum findAndReadJsonFilesType { dir, file, end }

// 递归查找并读取 JSON 文件
export function findAndReadJsonFiles(
    dir: string,
    fun: (
        type: findAndReadJsonFilesType,
        name: string,
        data: null | ShareContent
    ) => void
) {
    // 获取需要查找的目录
    dir = path.resolve(__dirname, dir);
    const files = fs.readdirSync(dir);
    // 开始查找
    files.forEach(file => {
        const name = path.join(dir, file);
        const stats = fs.statSync(name);

        // 判断是否是目录
        if (stats.isDirectory()) {
            fun(findAndReadJsonFilesType.dir, name, null)
            // 去下一层目录查找
            findAndReadJsonFiles(name, fun);
        } else if (path.extname(name).toLowerCase() === '.json') {
            try {
                // 读取JSON文件并转换成JS对象然后添加到数组中
                const data = fs.readFileSync(name, 'utf8');
                fun(findAndReadJsonFilesType.file, name, JSON.parse(data))
            } catch (error: any) {
                console.error(`读取或解析错误 - ${name}:`, error.message);
            }
        }
    });

    // 结束本层目录查找
    fun(findAndReadJsonFilesType.end, dir, null)
}

// 文件写入
export function writeFile(outputDir: string, fileName: string, data: any) {
    const jsonFilePath = path.resolve(outputDir, fileName);
    console.log(`构建请求API: ${jsonFilePath}`); // 打印路径
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// 确保输出目录存在
export function existsDir(dir: string | null = null) {
    let outputDir = dir ? { demo: dir } : apiDir;

    // 遍历所有目录
    Object.values(outputDir).forEach(outputDir => {
        // 判断是否存在目录，不存在则创建
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
    });
}