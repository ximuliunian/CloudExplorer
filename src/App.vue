<template>
    <Loading :flag="loadingFlag" />
    <div id="background-image" :style="{ backgroundImage: 'url(' + backImage + ')' }">
        <div class="mask-layer"></div>
    </div>
    <div class="app-container">
        <router-view v-slot="{ Component }" v-if="!fileInfoStore.showDetailPage">
            <Transition name="slide-fade" mode="out-in">
                <component :is="Component" />
            </Transition>
        </router-view>

        <DisplayIndex v-else />
    </div>
</template>

<script setup lang="ts">
import Loading from '@/components/loading.vue';
import { onMounted, ref } from 'vue';
import imgApi from '@/api/imgApi';
import useHandleSecret from '@/hooks/handle/HandleSecret';
import useHandleRouter from '@/hooks/handle/HandleRouter';
import { useFileInfoStore } from '@/stores/FileInfoStore';
import HandleRouter from '@/hooks/handle/HandleRouter';
import DisplayIndex from '@/views/display/displayIndex.vue';

// 加载动画开关
let loadingFlag = ref(false);
// 背景图片
let backImage = ref('');
// 文件信息
const fileInfoStore = useFileInfoStore();

// ---------- 初始化 ----------
useHandleSecret.init()
useHandleRouter.init()
// ---------- 初始化 ----------

onMounted(() => {
    handleBackImage();
});

/**
 * 判断最后一个元素是否以 .f 结尾，如果不是则重置文件详情
 */
HandleRouter.registerPathChangeCallback((pathList: string[]) => {
    if (!pathList) return;
    if (pathList.length === 0 || !pathList[pathList.length - 1].endsWith('.f')) {
        fileInfoStore.resetFileDetails();
    }
})

/**
 * 处理背景图片
 */
async function handleBackImage() {
    // 获取背景图片
    const imgList = await imgApi();
    const size = Math.floor(Math.random() * imgList.data.length)
    backImage.value = location.origin + imgList.data[size]

    // 背景图片加载判断
    const imageLoad = new Image();
    imageLoad.src = backImage.value;
    imageLoad.onload = () => loadingFlag.value = true    // 加载成功
    imageLoad.onerror = () => handleBackImage();    // 加载失败重新加载
}

</script>

<style scoped>
.app-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
}

.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}


/* 背景图片 */
#background-image {
    width: 100%;
    height: 100%;
    position: fixed;
    z-index: -1;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    user-select: none;
}

/* 遮罩层 */
.mask-layer {
    width: 100%;
    height: 100%;
    position: fixed;
    backdrop-filter: blur(0px);
}
</style>