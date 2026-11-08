<template>
    <Loading :flag="loadingFlag" />
    <div id="background-image" :style="{ backgroundImage: 'url(' + backImage + ')' }">
        <div class="mask-layer"></div>
    </div>
    <div class="app-container">
        <router-view v-slot="{ Component }">
            <Transition name="slide-fade" mode="out-in">
                <component :is="Component" />
            </Transition>
        </router-view>
    </div>
    <DisclaimerDialog />
</template>

<script setup lang="ts">
import Loading from '@/components/loading.vue';
import { onMounted, ref } from 'vue';
import imgApi from '@/api/imgApi';
import useHandleSecret from '@/hooks/handle/HandleSecret';
import useHandleRouter from '@/hooks/handle/HandleRouter';
import DisclaimerDialog from '@/components/DisclaimerDialog.vue';
import HandleSecret from '@/hooks/handle/HandleSecret';
import { initBaseShowInfo } from './stores/BaseShowInfo';

// 加载动画开关
let loadingFlag = ref(false);
// 背景图片
let backImage = ref('');

// ---------- 初始化 ----------
useHandleSecret.init()
useHandleRouter.init()
// ---------- 初始化 ----------


// 初始化系统展示信息
initBaseShowInfo();
HandleSecret.registerCheckSuccessCallback('checkSuccessUpdateBaseShowInfo', md5 => initBaseShowInfo(md5))

onMounted(() => {
    handleBackImage();
});

/**
 * 处理背景图片
 * @param retry 当前重试次数
 */
async function handleBackImage(retry = 0) {
    try {
        // 获取背景图片
        const imgList = await imgApi();
        const list = Array.isArray(imgList.data) ? imgList.data : [];
        if (list.length === 0) {
            loadingFlag.value = true;   // 没有背景图时直接结束加载
            return;
        }

        const imgInfo: string = list[Math.floor(Math.random() * list.length)];
        const imgUrl = imgInfo.indexOf('http') === -1 ? location.origin + imgInfo : imgInfo;

        // 背景图片加载判断
        const imageLoad = new Image();
        imageLoad.onload = () => {
            backImage.value = imgUrl;
            loadingFlag.value = true;   // 加载成功
        };
        imageLoad.onerror = () => {
            if (retry < 2) {
                handleBackImage(retry + 1); // 加载失败有限次重试
            } else {
                loadingFlag.value = true;
            }
        };
        imageLoad.src = imgUrl;
    } catch (error) {
        console.error('背景图片加载失败:', error);
        loadingFlag.value = true;   // 接口异常时结束加载
    }
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