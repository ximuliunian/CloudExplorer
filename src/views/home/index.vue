<template>
    <div class="container">
        <Search />
        <DataDisplay class="dataDisplay" />
    </div>
</template>

<script setup lang="ts">
import Search from "./components/Search.vue";
import DataDisplay from "./components/DataDisplay.vue";
</script>

<style scoped>
.container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 16px;
}

.dataDisplay {
    margin-top: 24px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease;
}

.container:has(.search-container.focused) .dataDisplay {
    transform: translateY(20px);
    opacity: 0.7;
    filter: blur(2px);
}

@media (max-width: 768px) {
    .container {
        padding: 0 12px;
    }

    .dataDisplay {
        margin-top: 20px;
    }
}
</style>