<template>
  <v-app>
    <div>
      <br/>
      <h2 class="text-h2" :style="{ textAlign: 'center' }">{{ trackDetails.name }}</h2>
      <br/>
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
                <v-subheader  class="text-subtitle-1"> {{ currentStageName }} Notes</v-subheader>
                <div>
                  <v-card
                    v-for="(note, index) in filteredNotes" 
                    :key="note.note_id"
                    class="my-2 pa-2"
                    outlined
                  >
                    <v-card-subtitle v-html="formattedNoteText(note.note_text)"></v-card-subtitle>
                    <br/>
                    <v-card-subtitle>{{ formatDate(note.timestamp) }}</v-card-subtitle>
                    <v-card-actions>
                      <v-btn icon @click="openEditNoteDialog(note, index)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon @click="deleteNote(note, index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </div>
                <v-btn color="primary" @click="openCreateNoteDialog">
                  <v-icon>mdi-plus</v-icon> Create Note
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
      <!-- Dialog for Note Creation and Update -->
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
          <v-card-title class="text-h6">{{ dialogTitle }}</v-card-title>
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
      <!-- Flash Message Display -->
      <div v-if="flashMessage" class="flash-notification">{{ flashMessage }}</div>
    </div>
  </v-app>
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
      const stages = ['Writing', 'Recording', 'Mixing', 'Mastering', 'Completed', 'Released'];
      const trackDetails = ref({ stage: '', notes: [], goalDate: '', track_id: '' });
      const dialog = ref(false);
      const newNoteText = ref("");
      const flashMessage = ref('');
      const dialogTitle = ref('Create a New Note');
      const editingNoteIndex = ref(null);

      const showFlashMessage = (message) => {
        flashMessage.value = message;
        setTimeout(() => flashMessage.value = '', 3000);
      };

      const getTrackDetails = async () => {
        try {
          const response = await axios.get(`/tracks/${trackId.value}/full_details`);
          trackDetails.value = response.data;
          console.log(trackDetails.value);
        } catch (error) {
          console.error('Failed to fetch track details:', error);
        }
      };

      const currentStage = computed(() => stages.indexOf(trackDetails.value.stage) + 1);
      const currentStageName = computed(() => stages[currentStage.value - 1]);

      const filteredNotes = computed(() => trackDetails.value.notes.filter(note => note.stage === currentStageName.value));

      const promptStageChange = (stage, stageNumber) => {
        if (currentStage.value !== stageNumber && confirm(`Change stage to ${stage}?`)) {
          updateStage(stage);
        }
      };

      const updateStage = (newStage) => {
        axios.patch(`/tracks/${trackId.value}`, { stage: newStage })
          .then(() => trackDetails.value.stage = newStage)
          .catch(error => console.error('Error updating the stage:', error));
      };

      const openCreateNoteDialog = () => {
        dialogTitle.value = 'Create Note';
        newNoteText.value = '';
        editingNoteIndex.value = null;
        dialog.value = true;
      };

      const openEditNoteDialog = (note, index) => {
        const fullNoteIndex = trackDetails.value.notes.findIndex(n => n.note_id === note.note_id);
        if (fullNoteIndex !== -1) {
          dialogTitle.value = 'Edit Note';
          newNoteText.value = trackDetails.value.notes[fullNoteIndex].note_text;
          editingNoteIndex.value = fullNoteIndex;
          dialog.value = true;
        } else {
          console.error('Note not found in the full list.');
  }
      };

      const saveNote = () => {
        if (!newNoteText.value.trim()) {
          alert("Please enter some text for the note.");
          return;
        }
        if (editingNoteIndex.value !== null) {
          updateNote(trackDetails.value.notes[editingNoteIndex.value], newNoteText.value);
        } else {
          createNote({ stage: currentStageName.value, note_text: newNoteText.value });
        }
        newNoteText.value = "";
        dialog.value = false;
        editingNoteIndex.value = null;
      };

      const updateNote = (note, updateText) => {
        axios.patch(`/notes/${note.note_id}`, { note_text: updateText })
          .then(() => {
            const noteIndex = trackDetails.value.notes.findIndex(n => n.note_id === note.note_id);
            trackDetails.value.notes[noteIndex].note_text = updateText;
          })
          .catch(error => console.error('Failed to update the note:', error));
      };

      const deleteNote = (note, index) => {
        if (confirm('Are you sure you want to delete this note?')) {
          axios.delete(`/notes/${note.note_id}`)
          .then(() => {
            trackDetails.value.notes = trackDetails.value.notes.filter(n => n.note_id !== note.note_id);
            showFlashMessage('Note deleted');
          })
          .catch(error => {
          console.error('Failed to delete the note:', error);
          alert('Failed to delete the note.');
        });
      }};

      const createNote = (noteData) => {
        axios.post(`/tracks/${trackId.value}/notes`, noteData)
          .then(response => {
            trackDetails.value.notes.push(response.data);
            showFlashMessage('Note created');
          })
          .catch(error => console.error('Failed to create the note:', error));
      };

      onMounted(getTrackDetails);

      return { trackDetails, stages, currentStage, currentStageName, filteredNotes, promptStageChange,
               dialog, newNoteText, saveNote, deleteNote, flashMessage, updateNote, openEditNoteDialog, openCreateNoteDialog,
               dialogTitle };
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

  .flash-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    color: white;
    background-color: rgba(0, 0, 0, 0.75);
    border-radius: 5px;
    z-index: 1050; 
    animation: fadeOut 3s forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}


  </style>