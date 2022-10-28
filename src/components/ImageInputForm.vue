<script setup>
import {ref, onMounted} from 'vue'

const upload_image = ref()
const image_url = ref('')

function uploadFile() {
    // const files = event.target.files || event.dataTransfer.files
    console.log(upload_image.value.innerHTML);
    console.log(image_url.value);
    image_url.value = URL.createObjectURL(upload_image.value)
}
</script>

<template>
<h2>hellohello</h2>
<div>
    <input type="file" ref="upload_image" @change="uploadFile"/>
    <img :src="image_url">
    {{ image_url }}
</div>
<!-- <div v-if="image_url">
</div> -->
</template>

<style>

</style>