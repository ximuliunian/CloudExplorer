import gutf from "./generateUpdateTimeFile";
import { apiDir, BaseInterface, existsDir, findAndReadJsonFiles, findAndReadJsonFilesType, writeFile } from "./indexPlugin";
import PathTree, { FileDetail } from '../src/types/PathTree';
import SearchList from '../src/types/SearchList';

interface GP extends BaseInterface {
}

let gp: GP = {} as GP;

gp.init = () => {
    const notSecret = buildPathTree(false)
    writeFile(apiDir.root, "path.json", notSecret.stackSpace) // 非保密内容索引
    writeFile(apiDir.root, "search.json", notSecret.searchPath) // 非保密搜索路径

    // 确保加密路径存在
    const md5 = gutf.getMd5();
    existsDir(`${apiDir.root}/${md5}`)

    const secret = buildPathTree(true)
    writeFile(apiDir.root, `${md5}_path.json`, secret.stackSpace) // 全部内容索引
    writeFile(apiDir.root, `${md5}_search.json`, secret.searchPath) // 全部内容搜索路径
}

// 构建路径树（is_all[true] = 查询全部 | is_all[false] = 查询非保密的内容）
const buildPathTree = (is_all: boolean) => {
    const nowDir: string[] = [] // 路径面包屑
    const stackSpace: PathTree[] = [{ name: "source", children: [], files: [] }];  // 栈空间
    const searchPath: SearchList[] = [];  // 查询路径

    findAndReadJsonFiles("../../source/", (type, name, data) => {
        const spiltPathName = spiltPath(name);  // 路径末端内容

        switch (type) {
            // 文件入栈
            case findAndReadJsonFilesType.file:
                if (!data) break;  // 数据不存在则跳过
                if (!is_all && data.is_secret) break;  // 数据为保密且查询非保密内容则跳过

                const fileType = data.type ?? 'file'

                // 文件入栈
                stackSpace[stackSpace.length - 1].files.push({
                    name: data.title,
                    type: fileType,
                    json_name: fileType === 'file' ? spiltPathName : data.url as string,
                    ...(is_all && { is_secret: data.is_secret }),
                } satisfies FileDetail);

                // 添加搜索路径
                searchPath.push({
                    name: data.title,
                    path: fileType === 'file' ? `${nowDir.join("/")}${nowDir.length > 0 ? '/' : ''}${data.title}.f` : data.url as string,
                    type: fileType,
                    json_name: spiltPathName,
                    ...(is_all && { is_secret: data.is_secret }),
                })

                // 当为 url 时，不写入文件
                if (fileType === 'url') break;

                /*
                 * 写入文件逻辑：
                 * 1. 非保密内容直接写入根目录
                 * 2. 保密内容写入加密路径下
                 * */
                let path = apiDir.root

                if (!is_all && !data.is_secret) {
                    writeFile(path, spiltPathName, data)
                }

                if (is_all && data.is_secret) {
                    if (data.is_secret) path = `${path}/${gutf.getMd5()}`;
                    writeFile(path, spiltPathName, data)
                }

                break;

            // 目录入栈
            case findAndReadJsonFilesType.dir:
                stackSpace.push({ name: spiltPathName, children: [], files: [] });
                nowDir.push(spiltPathName);
                break;

            // 目录出栈
            case findAndReadJsonFilesType.end:
                // 出栈到source目录为止
                if ("source" === spiltPathName) break;

                // 面包屑出栈
                nowDir.pop();

                /*
                 * 逻辑：
                 * 1. 出栈
                 * 2. 排序
                 * 3. 出栈元素添加到上一个栈顶元素的children中 
                 * */

                // 添加安全检查
                if (stackSpace.length <= 1) break;

                let temp = sort(stackSpace.pop());
                if (!temp) break;

                // 确保 stackSpace 不为空
                if (stackSpace.length > 0) {
                    stackSpace[stackSpace.length - 1].children.push(temp);
                }

                // 添加搜索路径
                searchPath.push({
                    name: spiltPathName,
                    path: `${nowDir.join("/")}${nowDir.length > 0 ? '/' : ''}${spiltPathName}`,
                    type: "dir",
                })
                break;
        }
    })

    return { stackSpace: stackSpace[0], searchPath };
}

// 排序
const sort = (obj: PathTree | null | undefined): PathTree | null => {
    if (!obj) return null;

    // 判断是否有子路径或子文件
    const bool: [boolean, boolean] = [true, true];

    // 判断是否有子路径
    if (obj.children.length !== 0) {
        obj.children.sort((a, b) => {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
        })
    } else bool[0] = false;

    // 判断是否有子文件
    if (obj.files.length !== 0) {
        obj.files.sort((a, b) => {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
        })
    } else bool[1] = false;

    return (bool[0] || bool[1]) ? obj : null;
}

// 分离出路径末端内容
const spiltPath = (str: string) => {
    const index = str.split(/[\\/]/);
    return index[index.length - 1];
}


export default gp;