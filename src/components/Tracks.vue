<template>
  <div>
    <br/>
    <h2 class="text-h2" :style="{ textAlign: 'center' }">My Tracks</h2>
    <br/>

    <!-- Button to open new track dialog -->
    <v-btn color="primary" dark @click="showDialog = true">
      + New Track
    </v-btn>

    <!-- Dialog for new track -->
    <v-dialog v-model="showDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">New Track</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Track Name" v-model="newTrack.name"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Release (EP, Album, Single)" v-model="newTrack.release"></v-text-field>
              </v-col>
              <v-select label="Current Stage" :items="stages" v-model="newTrack.stage"></v-select>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showDialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="submitNewTrack()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

      <!-- Goals Form Dialog -->
      <v-dialog v-model="goalsDialog" persistent max-width="600px">
        <v-card>
          <v-card-title>Enter Goals for {{ newTrack.name }}</v-card-title>
          <v-card-text>
            <v-text-field v-for="stage in stages" :key="stage" :label="`${stage} Goal (YYYY-MM-DD)`" v-model="newGoals[stage]"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="submitGoals()">Save Goals</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    <!-- Existing tracks list -->
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

export default {
  name: 'Tracks',
  setup() {
    const userId = ref('1'); // Assuming the user ID is static, replace as needed
    const tracks = ref([]);
    const page = ref(1);
    const showDialog = ref(false);
    const stages = ['Writing', 'Recording', 'Mixing', 'Mastering', 'Released'];
    const newTrack = ref({
      name: '',
      release: '',
      stage: '',
      goals: {
        Writing: '',
        Recording: '',
        Mixing: '',
        Mastering: '',
        Released: ''
      }
    });
    const trackDialog = ref(true);  // Initially show track dialog
    const goalsDialog = ref(false);
    const newGoals = ref({});

    // Compute goals input visibility based on current stage
    const goalsInputVisible = computed(() => {
      return newTrack.value.stage !== 'Released';
    });

    const fetchTracks = async () => {
      try {
        const response = await axios.get(`/users/${userId.value}/tracks`);
        tracks.value = response.data;
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
      }
    };

    const submitNewTrack = async () => {
      try {
        const trackData = {
          name: newTrack.value.name,
          release: newTrack.value.release,
          stage: newTrack.value.stage
        };
        await axios.post(`/users/${userId.value}/tracks`, trackData);
        trackDialog.value = false;
        stages.forEach(stage => { newGoals.value[stage] = ''; });  // Prepare goals form
        trackDialog.value = false;
        goalsDialog.value = true;  // Open goals dialog
        fetchTracks();
        resetNewTrack();
      } catch (error) {
        console.error('Failed to submit new track:', error);
      }
    };

    const resetNewTrack = () => {
      newTrack.value = {
        name: '',
        release: '',
        stage: '',
        goals: {
          Writing: '',
          Recording: '',
          Mixing: '',
          Mastering: '',
          Released: ''
        }
      };
    };

    const submitGoals = async () => {
  // Check if any goals have been provided
      const hasGoals = Object.values(newGoals.value).some(goal => goal.trim() !== '');

      if (hasGoals) {
        try {
          await axios.post(`/tracks/${newTrack.value.id}/goals`, { goals: newGoals.value });
          console.log("Goals saved successfully");
        } catch (error) {
          console.error('Error submitting goals:', error);
        }
      } else {
        console.log("No goals provided, skipping goal submission.");
      }

      // Close the goals dialog regardless of whether an API call was made
      goalsDialog.value = false;
    };

    onMounted(fetchTracks);

    return { page, tracks, showDialog, newTrack, submitNewTrack, goalsInputVisible, stages,
              submitGoals, trackDialog, goalsDialog, newGoals };
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