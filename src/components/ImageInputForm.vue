<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// APIのURL
const pose_keypoint_api_url = "https://lddngv4k56.execute-api.ap-northeast-1.amazonaws.com/v2/pose-keypoint"

// 登録画像
const image_url = ref('')
const image_file = ref(new Blob)
// keypoint画像
const image_keypoint_url = ref('')
const loading_image_api_flag = ref(false)
const keypoint_info = ref('')

/**
 * 登録画像ファイルから情報を取得
 */
function uploadFile(e) {
  // clear keypoint image
  clearImageKeypoint()
  // file blob for post to api
  try {
    image_file.value = e.target.files[0]
  } 
  catch {
    image_file.value = e.dataTransfer.files[0]
  }
  // image url for preview
  image_url.value = URL.createObjectURL(image_file.value)
}

function clearFile() {
  image_url.value = ''
  clearImageKeypoint()
}

function clearImageKeypoint() {
  image_keypoint_url.value = ''
  keypoint_info.value = ''
}

/**
 * pose-keypoint-apiに画像データをPOST
 * keypoint画像を取得
 */
async function submitImage() {
  clearImageKeypoint()

  const post_data = JSON.stringify({
    'body': await base64Encode(image_file.value),
    'model': "lightning",
    'format': "normal"
  })
  // Debug出力、登録画像をencodeしてdecodeしたものを出力
  // image_keypoint_url.value = await base64Decode(JSON.parse(post_data)['body'], image_file.value['type'])
  // console.log(image_keypoint_url.value);

  // APIにPOST
  loading_image_api_flag.value =  true
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
      keypoint_info.value = response.data.body.data['0']
      console.log(keypoint_info.value)
      base64Decode(response.data.file.original_image, image_file.value['type'])
        .then(result => {
          image_keypoint_url.value = result
          console.log('Success!')
        })
    })
    .catch((error) => {
      console.log(error.response.data)
    })
    .finally(() => {
      loading_image_api_flag.value = false
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
  return await fetch(`data:${type};base64,` + text)
    .then(response => response.url)
    .catch(() => '')
} 
</script>


<template>

  <v-container>
    <div 
      class="ma-2 pa-2"
      @dragover.prevent 
      @drop.prevent="uploadFile"
    >
      <v-file-input 
        label="まずは画像を選択" 
        accept="image/*" 
        variant="outlined"
        @change="uploadFile" 
        @click:clear="clearFile"
      />
      <v-btn 
        variant="flat"
        color="primary"
        @click="submitImage" :disabled="image_url === ''">
        Get
      </v-btn>
    </div>

    <v-row
      justify="center"
      align-content="center"
    >
      <v-col cols="6">
        <v-card
          class="bg-grey-lighten-3" 
          min-height="200"
          variant="flat"
        >
          <p class="font-weight-bold">Upload Image View</p>

          <v-img height="600" :src="image_url" v-if="image_url !== ''"></v-img>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card 
          class="bg-grey-lighten-3 " 
          min-height="200"
          variant="flat"
        >
          <p class="font-weight-bold">Keypoint Image View</p>
          
          <v-progress-circular 
            :size="100" 
            :width="10"
            color="purple" 
            indeterminate
            class="ma-8 pa-4"
            v-if="loading_image_api_flag"
          ></v-progress-circular>

          <v-img height="600" :src="image_keypoint_url" v-if="image_keypoint_url !== ''"></v-img>
        </v-card>
      </v-col>
    </v-row>

    <v-card
      class="my-2 pa-2"
      variant="outlined"
      style="text-align: left;"
    >
      <p class="font-weight-bold" style="text-align: center;">Keypoint Information</p>

      <v-card-text class="ml-4">
        <p v-if="keypoint_info.score">
          <span class="font-weight-black">whole score:</span> {{ keypoint_info.score }}
        </p>
      </v-card-text>

      <!-- <v-list> -->
        <v-row>
          <v-col 
            cols="4"
            v-for="(keypoint, index) in keypoint_info.keypoints"
            :key="keypoint.name"  
          >
            <v-card 
              height="100"
              variant="flat"
              class="px-4 ml-4"
            >
              <p class="font-weight-bold text-decoration-underline">
                {{index}}. {{ keypoint.name }}
              </p>
              <div>
                <p><span class="font-weight-bold">x:</span> {{ keypoint.x }}</p>
                <p><span class="font-weight-bold">y:</span> {{ keypoint.y }}</p>
                <p><span class="font-weight-bold">score:</span> {{ keypoint.score }}</p>
              </div>
          </v-card>
          </v-col>
        </v-row>
      <!-- </v-list> -->
    </v-card>

  </v-container>

</template>


<style>

</style>