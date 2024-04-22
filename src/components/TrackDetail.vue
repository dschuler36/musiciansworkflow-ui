<template>
  <div>
    <h1 :style="{ textAlign: 'center' }">{{ trackDetails.name }}</h1>
    <!-- Workflow Stepper -->
    <v-stepper v-model="currentStage">
      <v-stepper-header>
        <template v-for="(stage, index) in stages" :key="index">
          <v-stepper-item
            :title="stage"
            :value="index + 1"
            :complete="index + 1 < currentStage || (stage === 'Released' && index + 1 === currentStage)"
            :editable="true"
            @click="promptStageChange(stage, index + 1)"
          ></v-stepper-item>
          <v-divider v-if="index < stages.length - 1"></v-divider>
        </template>
      </v-stepper-header>
    </v-stepper>
    <!-- Track Details Card -->
    <v-card class="mt-5">
      <v-card-title class="headline">Track Details</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <!-- Goal at the top spanning full width -->
            <v-col cols="12">
              <v-subheader>Goal</v-subheader>
              <v-chip>{{ formatDate(trackDetails.goalDate) }}</v-chip>
            </v-col>

            <!-- Notes span the full width below the Goal -->
            <v-col cols="12">
              <v-subheader> {{ currentStageName }} Notes</v-subheader>
              <div>
                <v-card 
                  v-for="(note, index) in filteredNotes" 
                  :key="index"
                  class="my-2 pa-2"
                  outlined
                >
                  <v-card-title v-html="formattedNoteText(note.note_text)"></v-card-title>
                  <v-card-subtitle>{{ formatDate(note.timestamp) }}</v-card-subtitle>
                </v-card>
              </div>
              <v-btn color="primary" @click="dialog = true">
                <v-icon>mdi-plus</v-icon>Create Note
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
    <!-- Note Creation Button -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title class="text-h6">
          Create a New Note
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="newNoteText"
            label="Note text"
            auto-grow
            rows="2"
            maxlength="500"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="saveNote">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    
<script>
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';
  import { useRoute } from 'vue-router';

  export default {
    name: 'TrackDetail',
    setup() {
      const route = useRoute();
      const trackId = ref(route.params.trackId);
      const stages = ['Writing', 'Recording', 'Mixing', 'Mastering', 'Released'];
      const trackDetails = ref({
        stage: '',
        notes: [],  // Initialize notes as an empty array
        goalDate: '',
        track_id: ''
      });
      const dialog = ref(false);  // Initialize the dialog state as closed
      const newNoteText = ref("");  // Initialize new note text

      const getTrackDetails = async () => {
        try {
          const response = await axios.get(`/tracks/${trackId.value}/full_details`);
          trackDetails.value = response.data;
        } catch (error) {
          console.error('Failed to fetch track details:', error);
          trackDetails.value = { stage: '', notes: [], goalDate: '', track_id: '' };  // Ensure default values on error
        }
      };

      const currentStage = computed(() => {
        return stages.indexOf(trackDetails.value.stage) + 1;
      });

      const currentStageName = computed(() => {
        return stages[currentStage.value - 1];
      });

      const filteredNotes = computed(() => {
        if (!trackDetails.value.notes || !Array.isArray(trackDetails.value.notes)) {
          return [];
        }
        return trackDetails.value.notes.filter(note => note.stage === currentStageName.value);
      });

      function promptStageChange(stage, stageNumber) {
        if (currentStage.value !== stageNumber) {
          if (confirm(`Change stage to ${stage}?`)) {
            updateStage(stage);
          }
        }
      }

      function updateStage(newStage) {
        axios.patch(`/tracks/${trackId.value}`, { stage: newStage })
        .then(() => {
          trackDetails.value.stage = newStage;
        })
        .catch(error => {
          console.error('Error updating the stage:', error);
          alert('Failed to update the stage.');
        });
      }

      
    function saveNote() {
      if (newNoteText.value.trim()) {
        const newNoteData = {
          text: newNoteText.value,
          // include other data fields as required
        };
        createNote(newNoteData);
        newNoteText.value = ""; // Clear input after saving
        dialog.value = false; // Close dialog
      } else {
        alert("Please enter some text for the note.");
      }
    }

      function createNote(noteData) {
        console.log(currentStageName.value);
        console.log(noteData);
        axios.post(`/tracks/${trackId.value}/notes`, { stage: currentStageName.value, note_text: noteData.text })
        .then(response => {
          trackDetails.value.notes.push(response.data); // Assuming response.data is the new note object
          // getTrackDetails(trackId.value); could do this to repull the data to ensure consistency. err on side of speed for now.
        })
        .catch(error => {
          console.error('Failed to create the note:', error);
          alert('Failed to create the note.');
        });
      }

      onMounted(() => {
        getTrackDetails();
      });

      return { trackDetails, stages, currentStage, currentStageName, filteredNotes, promptStageChange,
               dialog, newNoteText, saveNote };
    },

    methods: {
      formatDate(date) {
        return new Date(date).toLocaleDateString();
      },

      formattedNoteText(text) {
        return text.replace(/\n/g, '<br>');
      }
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

  /* Styling for completed stages */
  .stage-complete .v-stepper__step__step {
    color: green !important; /* Change the checkmark color */
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

  .my-2 {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .pa-2 {
    padding: 0.5rem;
  }


  </style>