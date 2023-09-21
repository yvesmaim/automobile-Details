<template>
      <tr v-if="part">
        <td>{{ part.id }}</td>
        <td>{{ part.name }}</td>
        <td>{{ part.price }}</td>
        <td>{{ part.quantity }}</td>
  <!--     <td>{{ calculateTotalPrice(part) }}</td>--> 
        <td>
     <!--  <button @click="deletePart(index)">Удалить</button>-->   
        </td>
      </tr>
      <tr v-for="(childPart, childIndex) in part?.children" :key="childIndex">
        <td colspan="6"> <!-- Объединим ячейки, чтобы вставить компонент -->
          <child-parts
            :part="childPart"
            :index="childIndex"
            :calculateTotalPrice="calculateTotalPrice"
            :deletePart="deletePart"
          />
        </td>
      </tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Part } from '@/carParts'; 
  
export default defineComponent({
  name: 'child-parts',
  props: {
    part: {
      type: Object as () => Part | undefined,
      default: undefined,
    },
    index: Number,
    calculateTotalPrice: Function,
    deletePart: Function,
  },
});
</script>
