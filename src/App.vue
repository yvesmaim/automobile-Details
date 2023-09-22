<template>
  <div id="app">
    <b-container>
    <header>
      <h1>Сведения о деталях автомобиля</h1>
    </header>
    <main>
      <aside class="sidebar">
        <b-button-group>
        <b-button @click="exportTableToExcel" id="exportToExcel">Экспорт в Excel</b-button>
        <b-button @click="exportTableToPDF" id="exportToPDF">Экспорт в PDF</b-button>
        </b-button-group>
      </aside>
      <div class="content">
        <b-table-simple id="partstable">
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
            <tr v-if="parts.length === 0">
              <td>Список деталей пуст.</td>
            </tr>
            <tr v-for="(part, index) in parts" :key="index">
              <td>{{ part.id }}</td>
              <td>{{ part.name }}</td>
              <td>{{ part.price }}</td>
              <td>{{ part.quantity }}</td>
              <td>{{ part.cost }}</td>
              <td>
                <b-button-group>
                <b-button @click="editPart(index)">Редактировать</b-button>
                <b-button @click="deletePart(index)">Удалить</b-button>
                </b-button-group>
              </td>
            </tr>
            <!-- Форма для добавления новых деталей -->
            <create-dialog v-model:show="addDialogVisible">
              <tr v-if="showNewPartForm">
                <td>
                  <b-form-select v-model="selectedPartId">
                    <b-form-select-option value="">Новая деталь</b-form-select-option>
                    <b-form-select-option v-for="part in availableParts" :key="part.id" :value="part.id">
                      Входит в {{ part.id }} - {{ part.name }}
                    </b-form-select-option>
                  </b-form-select>
                </td>
                <td><b-form-input v-model="newPartName" placeholder="Название детали" /></td>
                <td><b-form-input v-model.number="newPartPrice" placeholder="Цена" /></td>
                <td><b-form-input v-model.number="newPartQuantity" placeholder="Количество" /></td>
                <td>
                  <b-button-group>
                  <b-button @click="addNewPart">Добавить</b-button>
                  <b-button @click="clearNewPart">Отменить</b-button>
                  </b-button-group>
                </td>
              </tr>
            </create-dialog>
            <create-dialog v-model:show="editDialogVisible">
            <tr v-if="editMode">
            <td><b-form-input v-model="newPartName"></b-form-input></td>
            <td><b-form-input v-model="newPartPrice"></b-form-input></td>
            <td><b-form-input v-model="newPartQuantity"></b-form-input></td>
            <td>
              <b-button-group>
                <b-button @click="editNewPart">Изменить</b-button>
                <b-button @click="clearNewPart">Отменить</b-button>
              </b-button-group>
            </td>
          </tr>
            </create-dialog>
          </tbody>
        </b-table-simple>
        <b-button @click="showNewPart">Добавить деталь</b-button>
      </div>
    </main>
  </b-container>
  </div>
</template>

<script lang="ts">
import { Part, getCarParts, addNewPart, decreaseChildCount, increaseChildCount, calculateCosts, calculatePrices } from "./carParts";
import { defineComponent } from "vue";
import CreateDialog from "./components/createDialog.vue";
import ChildParts from "./components/childParts.vue";
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { sortBy } from "lodash";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default defineComponent({
  components: {
    CreateDialog,
    ChildParts
},
  
  data() {
    return {
      parts: [] as Array<Part>, // Массив деталей
      showNewPartForm: false, // Переключатель показа/скрытия формы добавления детали
      selectedPartId: "", // Идентификатор выбранной детали
      newPartName: "", // Название детали
      newPartPrice: 0, // Цена детали
      newPartQuantity: 0, // Количество детали
      newPartCost: 0, // Стоимость детали
      addDialogVisible: false, // Переключатель видимости диалогового окна добавления
      editDialogVisible: false, // Переключатель видимости диалогового окна редактирования
      editMode: false, // Переключатель видимости editMode
    };
  },

  created() {
    // Генерируем таблицу с готовыми записями
    this.parts = getCarParts();
  },

  computed: {
    availableParts(): Part[] {
      // Фильтруем доступные детали, чтобы исключить уже добавленные
      const availableParts: Part[] = [];
      const partsStack = [...this.parts];
      while (partsStack.length > 0) {
        const part = partsStack.pop()!;
        availableParts.push(part);
        //if (part.children) partsStack.push(...part.children);
      }
      return availableParts;
    },
  },
  methods: {
    // Показываем окно для добавления новой детали
    showNewPart() {
      this.selectedPartId = "";
      this.showNewPartForm = true;
      this.addDialogVisible = true;
    },

    showEditPart(){
      this.editMode = true;
      this.editDialogVisible = true;
    },

    // Сортировка по ID
    sortParts() {
    this.parts = sortBy(this.parts, "id");
    },

    // Добавляем новую деталь
    addNewPart() {
      if (!this.selectedPartId) {
        const newPartId = `${this.parts.length + 1}`;
        const newPart: Part = {
          id: newPartId,
          name: this.newPartName,
          price: this.newPartPrice,
          quantity: this.newPartQuantity,
          cost: this.newPartPrice * this.newPartQuantity,
          parentId: null,
          childCount: 0,
          children: [],
        };
        this.parts.push(newPart);
      } else {
        const parentPart = this.findPartById(this.selectedPartId);
        if (parentPart) {
          const newPartId = `${parentPart.id}.${parentPart.childCount + 1}`;
          const newPart: Part = {
            id: newPartId,
            name: this.newPartName,
            price: this.newPartPrice,
            quantity: this.newPartQuantity,
            cost: this.newPartPrice * this.newPartQuantity,
            parentId: parentPart.id,
            childCount: 0,
            children: [],
          };
          this.parts.push(newPart);
          parentPart.children.push(newPart);
          increaseChildCount(parentPart);
        }
      }

      // Сбрасываем значения полей и скрываем форму
      this.selectedPartId = "";
      this.newPartName = "";
      this.newPartPrice = 0;
      this.newPartQuantity = 0;
      this.newPartCost = 0;
      this.showNewPartForm = false;
      this.addDialogVisible = false;
      this.editMode = false;
      this.editDialogVisible = false;

      // Пересчитываем цены и стоимости
      calculatePrices(this.parts);
      calculateCosts(this.parts);
      
      // Сортируем детали по ID
      this.sortParts();
    },

    // Редактируем деталь
    editNewPart() {
  if (!this.selectedPartId) {
    const newPartId = `${this.parts.length + 1}`;
    const newPart: Part = {
      id: newPartId,
      name: this.newPartName,
      price: this.newPartPrice,
      quantity: this.newPartQuantity,
      cost: this.newPartPrice * this.newPartQuantity,
      parentId: null,
      childCount: 0,
      children: [],
    };
    this.parts.push(newPart);
  } else {
    const existingPart = this.findPartById(this.selectedPartId);
    if (existingPart) {
      // Обновляем существующую деталь
      existingPart.name = this.newPartName;
      existingPart.price = this.newPartPrice;
      existingPart.quantity = this.newPartQuantity;
      existingPart.cost = this.newPartPrice * this.newPartQuantity;
    }
  }

  // Сбрасываем значения полей и скрываем форму
  this.selectedPartId = "";
  this.newPartName = "";
  this.newPartPrice = 0;
  this.newPartQuantity = 0;
  this.newPartCost = 0;
  this.showNewPartForm = false;
  this.addDialogVisible = false;
  this.editMode = false;
  this.editDialogVisible = false;

  // Пересчитываем цены и стоимости
  calculatePrices(this.parts);
  calculateCosts(this.parts);
  
  // Сортируем детали по ID
  this.sortParts();
},
  
    // Очищение полей формы добавления новой детали
    clearNewPart() {
      this.selectedPartId = "";
      this.newPartName = "";
      this.newPartPrice = 0;
      this.newPartQuantity = 0;
      this.newPartCost = 0;
      this.showNewPartForm = false;
      this.addDialogVisible = false;
      this.editMode = false;
      this.editDialogVisible = false;
    },

    // Удаление строки по идентификатору детали
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
        this.parts.splice(index, 1);
      }
    },

    // Режим редактирования детали
    editPart(index: number) {
      this.showEditPart();
      const partToEdit = this.parts[index];
      this.editMode = true;
      this.selectedPartId = partToEdit.id;
      this.newPartName = partToEdit.name;
      this.newPartPrice = partToEdit.price;
      this.newPartQuantity = partToEdit.quantity;
  },  

    // Поиск детали по идентификатору
    findPartById(id: string): Part | null {
      const partsStack = [...this.parts];
      while (partsStack.length > 0) {
        const part = partsStack.pop()!;
        if (part.id === id) return part;
        if (part.children) partsStack.push(...part.children);
      }
      return null;
    },

    // Поиск родительской детали по идентификатору дочерней детали
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

    // Экспорт таблицы в Excel
    exportTableToExcel() {
      const data = this.parts.map(part => [part.id, part.name, part.price, part.quantity, part.cost]);

      const ws = XLSX.utils.aoa_to_sheet([['id', 'Деталь', 'Цена', 'Количество', 'Стоимость'], ...data]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, 'exported_data.xlsx');
    },

    // Экспорт таблицы в PDF
    exportTableToPDF() {
      const tableData = [['id', 'Деталь', 'Цена', 'Количество', 'Стоимость']];

      this.parts.forEach(part => {
        tableData.push([part.id, part.name, part.price.toString(), part.quantity.toString(), part.cost.toString()]);
      });

      const documentDefinition = {
        content: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: tableData,
            },
          },
        ],
      };

      pdfMake.createPdf(documentDefinition).download('exported_data.pdf');
    },

    isPartAdded(partId: string): boolean {
      return this.parts.some(part => part.id === partId || part.children.some(child => child.id === partId));
    },
    

  },
});

</script>

<style>
.table {
	width: 100%;
	border: none;
	margin-bottom: 20px;
	border-collapse: separate;
}
.table thead th {
	font-weight: bold;
	text-align: left;
	border: none;
	padding: 10px 15px;
	background: #EDEDED;
	font-size: 14px;
	border-top: 1px solid #ddd;
}
.table tr th:first-child, .table tr td:first-child {
	border-left: 1px solid #ddd;
}
.table tr th:last-child, .table tr td:last-child {
	border-right: 1px solid #ddd;
}
.table thead tr th:first-child {
	border-radius: 20px 0 0 0;
}
.table thead tr th:last-child {
	border-radius: 0 20px 0 0;
}
.table tbody td {
	text-align: left;
	border: none;
	padding: 10px 15px;
	font-size: 14px;
	vertical-align: top;
}
.table tbody tr:nth-child(even) {
	background: #F8F8F8;
}
.table tbody tr:last-child td{
	border-bottom: 1px solid #ddd;
}
.table tbody tr:last-child td:first-child {
	border-radius: 0 0 0 20px;
}
.table tbody tr:last-child td:last-child {
	border-radius: 0 0 20px 0;
}

</style>