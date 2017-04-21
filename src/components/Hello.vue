<template xmlns:v-on="http://www.w3.org/1999/xhtml">
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h1>{{ msg1 }}</h1>
    <h2>Essential Links</h2>
    <router-link to="/demo/案例">demo1</router-link>
    <div v-on:click="toDemo">demo2</div>
    <!--<a v-link="{path:'/demo/第三个'}">demo3</a>-->
    <ul v-for="item in items">
      <li>{{item.id}}</li>
    </ul>

  </div>
  <!--<div id="id_div">
    {{message}}
  </div>-->
</template>
<script src="../js/hello.js"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
