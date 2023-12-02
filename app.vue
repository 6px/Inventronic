<template>
    <AppContainer>
        <AppHeader />
        <PageContainer>
            <NuxtPage />
        </PageContainer>
    </AppContainer>
</template>
<script lang="ts" setup>
useHead({
titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Inventronic` : 'Inventronic';
}
})
</script>