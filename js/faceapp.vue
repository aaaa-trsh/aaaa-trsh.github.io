<template>
    <div id="app">
        <div>
            <div style="width:10em;"></div>
            <div></div>
            <div></div>
        </div>
    </div>
</template>

<script>
import TodoList from './components/TodoList.vue'

export default {
	components: {
		TodoList
	}
}
</script>

<style lang="scss">
    @import './variables.scss';

    *, *::before, *::after {
        box-sizing: border-box;
    }

    #app {
        max-width: 400px;
        margin: 0 auto;
        line-height: 1.4;
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: $vue-blue;
    }

    h1 {
        text-align: center;
    }
</style>