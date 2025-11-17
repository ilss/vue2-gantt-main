<!--
 * @Author: Liang Liang
 * @Date: 2025-11-13 09:42:33
 * @Description: 
-->
<template>
  <div id="app">
    <nav>
      <router-link to="/">vue-gantt-chart</router-link>
      <router-link to="/frappe">Frappe</router-link>
      <router-link to="/highcharts">Highcharts</router-link>
      <router-link to="/dhtml">DHTMLX</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin-right: 20px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
