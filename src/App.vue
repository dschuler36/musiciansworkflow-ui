<template>
  <v-app>
    <v-app-bar app dense>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title @click="$router.push('/')" class="display-1" style="cursor:pointer">Musician's Workflow</v-toolbar-title>
      <v-spacer></v-spacer> <!-- This pushes the following content to the right side -->
      <v-btn text @click="logout">Logout</v-btn>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item link v-for="item in menuItems" :key="item.title" :to="item.path">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main content -->
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: false,
    menuItems: [
      { title: 'Tracks', icon: 'mdi-music-note', path: '/tracks' },
      { title: 'Releases', icon: 'mdi-album', path: '/releases' },
      { title: 'Goals', icon: 'mdi-flag', path: '/goals' }
    ]
  }),
  methods: {
    logout() {
      // Implement your logout logic here
      console.log('Logging out...');
    }
  }
}
</script>
