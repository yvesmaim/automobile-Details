<template>
  <div id="app">
    <header>
      <h1>Сведения о деталях автомобиля</h1>
    </header>
    <main>
      <aside class="sidebar">
      </aside>
      <div class="content">
        <table class="partstable">
          <thead>
            <tr>
              <th></th>
              <th>Деталь</th>
              <th>Цена</th>
              <th>Количество</th>
              <th>Стоимость</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="parts.length == 0">
            <td>Список деталей пуст.</td></tr>
            <tr v-for="(part, index) in parts" :key="index">
              <td>{{ part.id }}</td>
              <td>{{ part.name }}</td>
              <td>{{ part.price }}</td>
              <td>{{ part.quantity }}</td>
              <td>{{ part.price * part.quantity }}</td>
              <td>
                <button @click="deletePart(index)">Удалить</button>
              </td>
            </tr>
            <!-- Форма для добавления новых деталей -->
            <create-dialog v-model:show="dialogVisible">
            <tr v-if="showNewPartForm">
              <td>
                <select v-model="selectedPartId">
                  <option value="">Новая деталь</option>
                  <option v-for="part in availableParts" :key="part.id" :value="part.id">
                    Входит в {{ part.id }} - {{ part.name }}
                  </option>
                </select>
              </td>
              <td><input v-model="newPartName" placeholder="Название детали" /></td>
              <td><input v-model.number="newPartPrice" placeholder="Цена" /></td>
              <td><input v-model.number="newPartQuantity" placeholder="Количество" /></td>
              <td>
                <button @click="addNewPart">Добавить</button>
                <button @click="clearNewPart">Отменить</button>
              </td>
            </tr>
            </create-dialog>
          </tbody>
        </table>
        <button @click="showNewPart">Добавить деталь</button>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Part, getCarParts, addNewPart, decreaseChildCount } from "./carParts";
import { defineComponent } from "@vue/runtime-core";
import CreateDialog from "./components/createDialog.vue";

export default defineComponent({
  components:{
    CreateDialog
  },
  
  data() {
    return {
      parts: [] as Array<Part>, // Массив parts для хранений деталей
      showNewPartForm: false, // Флаг для отоброжения формы добавления новых деталей
      selectedPartId: "", // ID выбранной детали
      newPartName: "", // Название новой детали
      newPartPrice: 0, // Цена новой детали
      newPartQuantity: 0, // Количество новой детали
      dialogVisible: false,
    };
  },

  created() {
    this.parts = getCarParts();
  },

  computed: {
    // Генерация списка доступных деталей и их дочерних деталей для select
    availableParts(): Part[] { 
      const availableParts: Part[] = [];
      const partsStack = [...this.parts];
      while (partsStack.length > 0) {
        const part = partsStack.pop()!;
        availableParts.push(part);
        if (part.children) partsStack.push(...part.children);
      }
      return availableParts;
    },
  },

  methods: {
    // Показать форму для добавления новой детали
    showNewPart() {
      this.selectedPartId = "";
      this.showNewPartForm = true;
      this.dialogVisible = true;
    },

    // Добавление новой детали
    addNewPart() {
      let selectedPart = this.findPartById(this.selectedPartId);
      if (!selectedPart) {
        // Создаем новую главную деталь
        const newPartId = `${this.parts.length + 1}`;
        selectedPart = {
          id: newPartId,
          name: this.newPartName,
          price: this.newPartPrice,
          quantity: this.newPartQuantity,
          childCount: 0,
        };
        this.parts.push(selectedPart);
      }
      // Создаем дочернюю деталь
      const newPart: Part = {
        id: `${selectedPart.id}.${selectedPart.children ? selectedPart.children.length + 1 : 1}`,
        name: this.newPartName,
        price: this.newPartPrice,
        quantity: this.newPartQuantity,
        childCount: 0,
      };

      if (!selectedPart.children) {
        selectedPart.children = [];
      }
      selectedPart.children.push(newPart);

      this.selectedPartId = "";
      this.newPartName = "";
      this.newPartPrice = 0;
      this.newPartQuantity = 0;
      this.showNewPartForm = false;
      this.dialogVisible = false;
    },

    // Отмена добавления новой детали
    clearNewPart() {
      this.selectedPartId = "";
      this.newPartName = "";
      this.newPartPrice = 0;
      this.newPartQuantity = 0;
      this.showNewPartForm = false;
    },

    deletePart(index: number) {
      const partToDelete = this.parts[index];
      const parentPart = this.findParentPart(partToDelete.id);
      if (parentPart && parentPart.children) {
        const childIndex = parentPart.children.findIndex((child) => child.id === partToDelete.id);
        if (childIndex !== -1) {
          parentPart.children.splice(childIndex, 1);
          decreaseChildCount(parentPart);
        }
      } else {
        // Если это корневая деталь
        this.parts.splice(index, 1);
      }
    },

    findPartById(id: string): Part | null {
      const partsStack = [...this.parts];
      while (partsStack.length > 0) {
        const part = partsStack.pop()!;
        if (part.id === id) return part;
        if (part.children) partsStack.push(...part.children);
      }
      return null;
    },

    findParentPart(childId: string): Part | null {
      const partsStack = [...this.parts];
      while (partsStack.length > 0) {
        const part = partsStack.pop()!;
        if (part.children) {
          const childIndex = part.children.findIndex((child) => child.id === childId);
          if (childIndex !== -1) {
            return part;
          }
          partsStack.push(...part.children);
        }
      }
      return null;
    },
  },
});
</script>

<style>
/* Стили CSS здесь */
</style>
