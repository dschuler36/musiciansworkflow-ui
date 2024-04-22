<template>
  <div>
    <h1 align="center">My Tracks</h1>
    <br/>
    <v-data-iterator :items="tracks" :page.sync="page" :items-per-page="5">
      <template v-slot:default="{ items }">
        <div v-for="(item, i) in tracks" :key="i">
          <v-card>
            <!-- Row for card content -->
            <v-row align="center">
              <!-- Track Name -->
              <v-col cols="4">
                <router-link :to="{ name: 'TrackDetail', params: { trackId: item.track_id }}">
                  <v-card-title class="justify-start">{{ item.name }}</v-card-title>
                </router-link>
              </v-col>
              
              <!-- Stage and Goal -->
              <v-col cols="4">
                <v-card-text>Stage: {{ item.stage }}</v-card-text>
                <v-card-text>Goal: {{ item.goal }}</v-card-text>
              </v-col>
              
              <!-- Release and Album Art -->
              <v-col cols="4">
                <v-card-text class="text-right">{{ item.release }}</v-card-text>
                <!-- Assuming you have a path to album art -->
                <v-img :src="item.albumArt" aspect-ratio="1.7" contain></v-img>
              </v-col>
            </v-row>
          
          </v-card>
          <br>
        </div>
      </template>
    </v-data-iterator>
  </div>
</template>


  <script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'Tracks',
  setup() {
    const userId = ref('1'); // Assuming the user ID is static, replace as needed
    const tracks = ref([]);
    const page = ref(1);

    const fetchTracks = async () => {
      try {
        const response = await axios.get(`/users/${userId.value}/tracks`);
        console.log(response.data)
        tracks.value = response.data;
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
        // Handle errors appropriately in your app context
      }
    };

    onMounted(fetchTracks); // Fetch tracks when component is mounted

    return { page, tracks };
  }
};
  </script>
  
<style scoped>
.justify-start {
  justify-content: flex-start;
}

.text-right {
  text-align: right;
}

/* Optional: Additional styling for overall card layout */
.v-card {
  overflow: hidden; /* Ensures the content fits within the card */
}

.v-card-title, .v-card-text {
  font-size: 0.875rem; /* Smaller font size */
}

.v-img {
  max-height: 50px; /* Restricting image height can also help */
}
</style>