<template>
  <div class="mainDiv">
    <h1>{{ msg }}</h1>
    <h1>{{ msg1 }}</h1>
    <h2>Essential Links</h2>
  </div>
  <!--<div id="id_div">
    {{message}}
  </div>-->
</template>
<script src="../js/demo.js"></script>

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
