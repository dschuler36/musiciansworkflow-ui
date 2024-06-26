<template>
  <div>
    <br/>
    <h2 class="text-h2" :style="{ textAlign: 'center' }">My Tracks</h2>
    <br/>

    <!-- Button to open new track dialog -->
    <div class="button-container">
      <v-btn color="primary" dark @click="showDialog = true">
        + New Track
      </v-btn>
    </div>

    <v-container>
      <v-row align="center" justify="space-around">
        <v-col cols="4" sm="3">
          <v-card>
            <v-card-title class="headline">Track Summary</v-card-title>
            <v-card-text>
              <v-list dense>
                <v-list-item v-for="(count, stage) in trackCounts" :key="stage">
                  <v-list-item-content>
                    <v-list-item-title>{{ stage }}</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-content class="text-right">
                    <v-list-item-subtitle>{{ count }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="showDialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">New Track</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form ref="trackFormRef">
            <v-row>
              <v-col cols="12">
                <v-text-field 
                  label="Track Name" 
                  v-model="newTrack.name"
                  :rules="nameRules"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <!-- Release Dropdown -->
                <v-select 
                  ref="releaseDropdownCloser"
                  label="Release" 
                  :items="releases"
                  item-title="name"
                  item-text="name" 
                  item-value="release_id" 
                  v-model="newTrack.releaseId"
                  @change="handleReleaseSelection"
                >
                  <template v-slot:prepend-item>
                    <v-list-item ripple @click="handleNewReleaseClick">
                      <v-list-item-content>
                        <v-list-item-title>+ Create New Release</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    <v-divider class="mt-2"></v-divider>
                  </template>
                </v-select>
                <v-row v-if="showNewReleaseForm">
                  <v-col cols="12">
                    <v-text-field label="New Release Name" v-model="newRelease.name"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      label="Release Type"
                      :items="['Album', 'EP', 'Single']"
                      v-model="newRelease.type"
                      placeholder="Select type"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-menu
                      class="custom-menu-position"
                      ref="menu"
                      v-model="calendarToggle"
                      :close-on-content-click="false"
                      absolute
                      style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="releaseDate"
                          label="Release Date (optional)"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          @click.stop="calendarToggle = true"
                        ></v-text-field>
                      </template>
                      <v-date-picker v-model="releaseDate" @click="handleDateChange"></v-date-picker>
                      <!-- <v-date-picker v-model="newRelease.date" @input="calendarToggle = false"></v-date-picker> -->
                      <!-- <v-container>
                        <v-date-picker v-model="myDate"></v-date-picker>
                      </v-container>
                      <p>Selected date: {{ dateAsString }}</p> -->

                    </v-menu>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <v-select 
                  label="Current Stage" 
                  :items="stages" 
                  v-model="newTrack.stage"
                  :rules="stageRules"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="showDialog = false">Cancel</v-btn>
        <v-btn color="blue darken-1" text @click="submitNewTrack()">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

    <!-- New Release Dialog -->
    <v-dialog v-model="newReleaseDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Create New Release</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Release Name" v-model="newRelease.name"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Release Type" v-model="newRelease.type"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Release Date" v-model="newRelease.release_date"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="newReleaseDialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="createRelease()">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

      <!-- Goals Form Dialog -->
      <v-dialog v-model="goalsDialog" persistent max-width="600px">
        <v-card>
          <v-card-title>Stay on track. Enter goals for {{ newTrack.name }}</v-card-title>
          <v-card-text>
            <v-text-field v-for="stage in stages" :key="stage" :label="`${stage} Goal (YYYY-MM-DD)`" v-model="newGoals[`${stage.toLowerCase()}_goal`]"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="submitGoals()">Save Goals</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    <!-- Existing tracks list -->
    <div class="card-container">
      <v-data-iterator :items="tracks" :page.sync="page" :items-per-page="5">
        <template v-slot:default="{ items }">
          <div v-for="(item, i) in tracks" :key="i">
            <v-card class="track-card">
              <v-container fluid>
                <v-row no-gutters align="center">
                  <!-- Album Art -->
                  <v-col cols="2">
                    <v-img :src="item.albumArt" contain></v-img>
                  </v-col>

                  <!-- Track Info -->
                  <v-col cols="8">
                    <div class="track-info">
                      <router-link :to="{ name: 'TrackDetail', params: { trackId: item.track_id }}">
                        <span class="track-name">{{ item.name }}</span>
                      </router-link>
                        <div class="release-and-stage">
                        <span class="release-name">{{ item.release }}</span>
                        <v-chip :color="getStageColor(item.stage)" class="stage-chip">
                          {{ item.stage }}
                        </v-chip>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="2" class="last-updated">
                    {{ item.lastUpdated }}
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
            <br>
          </div>
        </template>
      </v-data-iterator>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, computed, nextTick, watch   } from 'vue';
import axios from 'axios';

export default {
  name: 'Tracks',
  setup() {
    const userId = ref('1'); // Assuming the user ID is static, replace as needed
    const tracks = ref([]);
    const page = ref(1);
    const showDialog = ref(false);
    const stages = ['Writing', 'Recording', 'Mixing', 'Mastering', 'Complete', 'Released'];
    const newTrack = ref({
      track_id: '',
      name: '',
      releaseId: '',
      stage: '',
      goals: {
        writing_goal: '',
        recording_goal: '',
        mixing_goal: '',
        mastering_goal: '',
        release_goal: ''
      }
    });
    const trackDialog = ref(true);  // Initially show track dialog
    const goalsDialog = ref(false);
    const newGoals = ref({});
    const newRelease = ref({ name: '', release_type: '',   release_date: ''});
    const releaseDate = ref(null); 
    const newReleaseDialog = ref(false);
    const releases = ref([]);
    const showNewReleaseForm = ref(false);
    const releaseMenuOpen = ref(false); // Controls the opening of the release dropdown
    const calendarToggle = ref(false);
    const releaseDropdownCloser = ref(null);
    const trackFormRef = ref(null);
    const trackCounts = ref({});


    // Validation rules
    const nameRules = [v => !!v || 'Track Name is required'];
    const stageRules = [v => !!v || 'Current Stage is required'];


    // Compute goals input visibility based on current stage
    const goalsInputVisible = computed(() => {
      return newTrack.value.stage !== 'Released';
    });

    const initializeNewGoals = () => {
      newGoals.value = {};
      stages.forEach(stage => {
        newGoals.value[`${stage.toLowerCase()}_goal`] = '';
      });
    };

    const fetchTracks = async () => {
      console.log('from fetchTracks', calendarToggle);
      try {
        const response = await axios.get(`/users/${userId.value}/tracks`);
        console.log('tracks', response);
        tracks.value = response.data;
        trackCounts.value = countTracksByStage();
        console.log(trackCounts);
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
      }
    };

    const submitNewTrack = async () => {
      console.log('trackformref', trackFormRef.value);
      if (trackFormRef.value.validate()) {
        let newReleaseData; // Define newReleaseData variable outside the if block

        if (showNewReleaseForm.value && newRelease.value.name) {
          newReleaseData = await createRelease(); // Assign the created release data
        }

        try {
          const trackData = {
            name: newTrack.value.name,
            stage: newTrack.value.stage,
          };

          if (newTrack.value.releaseId) {
            // existing release
            trackData.release_id = newTrack.value.releaseId;
          } else if (newReleaseData && newReleaseData.data.release_id) {
            // newly created release
            trackData.release_id = newReleaseData.data.release_id;
          }
          console.log('new track before posting', trackData);
          const response = await axios.post(`/users/${userId.value}/tracks`, trackData);
          newTrack.value.track_id = response.data.track_id;
          showDialog.value = false;
          initializeNewGoals();
          fetchTracks();
        } catch (error) {
          console.error('Failed to submit new track:', error);
        }
      }
    };

    const resetNewTrack = () => {
      newTrack.value = {
        track_id: '',
        name: '',
        release: '',
        stage: '',
        goals: {
          writing_goal: '',
          recording_goal: '',
          mixing_goal: '',
          mastering_goal: '',
          complete_goal: ''
        }
      };
    };

  const submitGoals = async () => {
    const goalsPayload = {};
    
    // Filter out empty goals and build the payload with correct keys
    Object.entries(newGoals.value).forEach(([key, value]) => {
      if (value.trim() !== '') {
        goalsPayload[key] = value;
      }
    });
    console.log(goalsPayload);

    // Send the goals if there are any non-empty entries
    if (Object.keys(goalsPayload).length > 0) {
      try {
        await axios.post(`/tracks/${newTrack.value.track_id}/goals`, goalsPayload );
      } catch (error) {
        console.error('Error submitting goals:', error);
      }
    } else {
      console.log("No goals provided, skipping goal submission.");
    }

    // Reset dialog states
    showDialog.value = false; // Close track creation dialog
    goalsDialog.value = false; // Close goals dialog
    resetNewTrack();
  };

  const fetchReleases = async () => {
      try {
        const response = await axios.get(`/users/${userId.value}/releases`);
        releases.value = response.data;
      } catch (error) {
        console.error('Failed to fetch releases:', error);
      }
    };

    const handleReleaseSelection = (selectedId) => {
      if (selectedId === null) {
        toggleNewReleaseForm(true);
      } else {
        console.log(selectedId);
        toggleNewReleaseForm(false);
      }
      releaseMenuOpen.value = false;  // Close the dropdown menu
    };

    const handleNewReleaseClick = async () => {
      toggleNewReleaseForm(true);
      if (releaseDropdownCloser.value) {
        releaseDropdownCloser.value.blur();
      }
      // releaseMenuOpen.value = false;  // Close the dropdown menu
    };

    const toggleNewReleaseForm = (show) => {
      showNewReleaseForm.value = show;
      if (!show) {
        newRelease.value = { name: '', type: '', date: '' };
      }
    };

    const createRelease = async () => {
      try {
        const postData = {};
        if (newRelease.value.name !== undefined) {
          postData.name = newRelease.value.name;
        }
        if (newRelease.value.type !== undefined) {
          postData.release_type = newRelease.value.type;
        }
        if (releaseDate.value !== undefined) {
          postData.release_date = releaseDate.value;
        }
        const response = await axios.post(`/users/${userId.value}/releases`, postData);
        console.log('new release response', response);
        releases.value.push(response.data);
        newTrack.value.releaseId = response.data.id;
        toggleNewReleaseForm(false);
        return response;
      } catch (error) {
        console.error('Failed to create new release:', error);
      }
    };

    const openNewReleaseDialog = () => {
      newReleaseDialog.value = true;
    };

    const checkForNewRelease = (item) => {
      if (!item) {
        openNewReleaseDialog();
      }
    };

    const handleDateChange = (newValue) => {
      const dateString = releaseDate.value.toISOString().substring(0, 10);
      const formattedDate = formatDate(dateString);
      if (formattedDate !== releaseDate.value) {
        releaseDate.value = formattedDate;
      }
    };

    function formatDate(date) {
      if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.valueOf())) {
          const formattedDate = parsedDate.toISOString().substring(0, 10);
          if (formattedDate !== date) {
            return formattedDate;
          }
        }
      }
      return date;
    };

    function countTracksByStage() {
      // Initialize an object to store the counts for each stage
      const stageCounts = {};

      // Loop through the tracks array
      tracks.value.forEach(track => {
        const stage = track.stage;
        // If the stage is already in the stageCounts object, increment its count
        if (stageCounts[stage]) {
          stageCounts[stage]++;
        } else {
          // If the stage is not in the stageCounts object, initialize its count to 1
          stageCounts[stage] = 1;
        }
      });

      return stageCounts;
    };


    onMounted(() => {
      fetchTracks();
      fetchReleases();
    })

    return { page, tracks, showDialog, newTrack, submitNewTrack, goalsInputVisible, stages, trackCounts,
             submitGoals, trackDialog, goalsDialog, newGoals, createRelease, openNewReleaseDialog, checkForNewRelease,
             toggleNewReleaseForm, handleReleaseSelection, showNewReleaseForm, newRelease, handleDateChange, releaseDate,
            newReleaseDialog, calendarToggle, releases, handleNewReleaseClick, releaseDropdownCloser, nameRules, stageRules, trackFormRef };
  },
  methods: {
    getStageColor(stage) {
    switch (stage) {
      case 'Writing':
        return 'blue';
      case 'Recording':
        return 'red';
      case 'Mixing':
        return 'orange';
      case 'Mastering':
        return 'yellowgreen';
      case 'Release':
        return 'green';
      default:
        return 'grey';
    }
  },
  toggleDatePicker() {
      this.calendarToggle = !this.calendarToggle;
  },
  updateDate(date) {
    this.newRelease.date = this.formatDate(date);
  }
},
computed: {
  stageClass() {
    const stage = this.item.stage.toLowerCase();
    const validStages = ['writing', 'recording', 'mixing', 'mastering', 'released'];
    return validStages.includes(stage) ? `stage-${stage}` : 'stage-default';
  }
}
};

</script>

<style scoped>
.custom-menu-position .v-menu__content {
  position: fixed !important;  /* Ensures the menu is positioned based on the viewport */
  top: 50% !important;         /* Adjust this value if necessary */
  left: 50% !important;        /* Adjust this value if necessary */
  transform: translate(-50%, -50%) !important; /* Ensures precise centering */
}

@media (max-width: 600px) {
  .custom-menu-position .v-menu__content {
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
  }
}
.justify-start {
  justify-content: flex-start;
}

.text-right {
  text-align: right;
}

/* Optional: Additional styling for overall card layout */
/* .v-card {
  overflow: hidden;
} */

.card-container {
  padding: 0 20px; /* Adjusts the padding on both sides */
  width: 100%; /* Takes full width of the viewport */
}

.v-card {
  width: 100%; /* Ensures cards stretch to fill the container */
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
  border: 1px solid #e0e0e02d; /* Light grey border */
  border-radius: 8px;
  margin-bottom: 20px; /* Space between cards */
  max-width: 1200px; /* Maximum width of the card */
  margin-left: auto; /* Centers the card horizontally */
  margin-right: auto;
}

@media (max-width: 600px) {
  .card-container {
    padding: 0 10px; /* Less padding on smaller screens */
  }
}
.v-card:hover {
  box-shadow: 0 8px 16px rgba(0,0,0,0.15); /* Enhanced shadow on hover */
}

.v-card-title, .v-card-text {
  font-size: 0.875rem; /* Smaller font size */
}

.button-container {
  display: flex;
  justify-content: center; /* Aligns the button to the center horizontally */
  margin-top: 20px; /* Optional: Adds some space above the button */
  margin-bottom: 20px;
}
.track-info {
  display: block;
}

.track-name {
  font-weight: bold;
  font-size: 1.2em;
  margin-bottom: 4px; /* Adds space below the track name */
  cursor: pointer; /* Changes cursor to indicate clickable */
  text-decoration: none; /* No underline by default */
  color: inherit; /* Keeps the text color consistent */
}

.release-and-stage {
  display: flex; /* Establishes a flex container */
  align-items: center; /* Aligns children vertically */
  gap: 8px; /* Adds space between the release name and the stage chip */
}

.release-name {
  font-size: 0.9em;
  color: #757575; /* Less emphasis on the release name */
}

.stage-chip {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 10px;
  line-height: 1;
  margin: 0; /* Removes any default margin if needed */
}


.v-chip {
  font-size: 0.75rem; /* Smaller font size */
  padding: 4px 8px; /* Reduced padding */
  border-radius: 10px; /* Adjusted border radius for a rounded look */
  line-height: 1; /* Adjust line height to control the height of the chip */
  margin-right: 4px; /* Space to the right of the chip */
  margin-bottom: 4px; /* Space below the chip */
}

.last-updated {
  text-align: right;
  font-size: 0.8em;
  color: #757575; /* Grey text for less emphasis */
}

/* For the album art */
.v-img {
  max-width: 80px; /* Set a max-width if necessary */
  border-radius: 50%; /* Circular image */
}

.stage-writing {
  background-color: blue;
}

.stage-recording {
  background-color: plum;
}

.stage-mixing {
  background-color: orange;
}

.stage-mastering {
  background-color: yellowgreen;
}

.stage-release {
  background-color: green;
}

/* Fallback for any stage not explicitly defined */
.stage-default {
  background-color: grey;
}


</style>