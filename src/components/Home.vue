<template>
    <v-container>
      <v-row justify="center">
          <h1 v-text="'Musicians Workflow'" class="text-h1"></h1>
          <br/>
          <br/>
          <h5 v-text="'Track your workflow. Set goals. Release more music.'" class="text-h5"></h5>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    name: 'Home'
  }
  </script>
  
  <style scoped>
  h1 {
    font-size: 24px;
    text-align: center;
    margin-top: 20px;
  }
  p {
    text-align: center;
    color: #666;
  }
  </style>
  