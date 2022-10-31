<script setup>
import {ref, onMounted} from 'vue'
import axios from 'axios'

// APIのURL
const pose_keypoint_api_url = "https://lddngv4k56.execute-api.ap-northeast-1.amazonaws.com/v2/pose-keypoint"

// 登録画像
const image_url = ref('')
const image_file = ref(new Blob)
// keypoint画像
const image_keypoint_url = ref('')

/**
 * 登録画像ファイルから情報を取得
 */
function uploadFile(e) {
    // clear keypoint image
    image_keypoint_url.value = ''
    // file blob for post to api
    image_file.value = e.target.files[0]
    // image url for preview
    image_url.value = URL.createObjectURL(image_file.value)
}

/**
 * pose-keypoint-apiに画像データをPOST
 * keypoint画像を取得
 */
async function submitImage() {
    const post_data = JSON.stringify({
        'body': await base64Encode(image_file.value)
    })
    // Debug出力、登録画像をencodeしてdecodeしたものを出力
    // image_keypoint_url.value = await base64Decode(JSON.parse(post_data)['body'], image_file.value['type'])
    // console.log(image_keypoint_url.value);
    
    // APIにPOST
    await axios
        .post(pose_keypoint_api_url, post_data, {
            'headers': {
                // 'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Type': 'application/json',
            }
        })
        .then((response) => {
            console.log(response)
            // keypoint画像情報を取得
            base64Decode(response.data.file, image_file.value['type'])
                .then(result => {
                    image_keypoint_url.value = result
                    console.log('Success!')
                })
        })
        .catch((error) => {
            console.log(error)
        })
}

/**
 * base64 encode decode 関数 (google先生からのコピペ、の改造)
 */ 
function base64Encode(...parts) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            const offset = reader.result.indexOf(",") + 1;
            resolve(reader.result.slice(offset));
        };
        reader.readAsDataURL(new Blob(parts));
    });
}

async function base64Decode(text, type = "text/plain;charset=UTF-8") {
    return await fetch(`data:${type};base64,`+text)
        .then(response => response.url)
        .catch(() => '')
} 
</script>


<template>
    <h2>hellohello</h2>

    <div>
        <input type="file" accept="image/*" @change="uploadFile"/>
        <img :src="image_url">
        <input type="submit" @click="submitImage" v-if="image_url">
    </div>

    <div>
        <img :src="image_keypoint_url">
    </div>
</template>


<style>

</style>