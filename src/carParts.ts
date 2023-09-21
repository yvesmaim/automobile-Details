// carParts.ts
export interface Part {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cost: number;
  parentId: string | null;
  children: Part[]; // Оставляем опциональное свойство children
  childCount: number; // Оставляем опциональное свойство childCount
}

export function increaseChildCount(part: Part) {
  part.childCount++;
}

export function decreaseChildCount(part: Part) {
  part.childCount--;
}

function childParent(parts: Part[]): void {
  for(let part of parts){
    if (part.parentId != null){
      const parentPart = parts.find((parent) => parent.id === part.parentId);
      if (parentPart) {
        increaseChildCount(parentPart);
        parentPart.children.push(part);
      }
  }
}
}

export function calculatePrices(parts: Part[]): void {
for (let part of parts){
  if (part.childCount > 0) {
    calculatePrices(part.children);
    let totalPrice = 0;
    for (const child of part.children) {
      totalPrice += child.price;
    }
    part.price = totalPrice;
  }
}
}

export function calculateCosts(parts: Part[]): void {
  for (let part of parts) {
    if (part.children.length > 0) {
      calculateCosts(part.children);
      let totalCost = 0;
      for (const child of part.children){
        totalCost += child.cost;
      }
      part.cost = totalCost * part.quantity;
;
    }
    else {
      part.cost = part.price * part.quantity;
  }
}
}


export function getCarParts(): Part[] {
  const parts: Part[] = [
    {
    id: '1',
    name: 'Кузов',
    price: 0,
    quantity: 1,
    cost: 0,
    parentId: null, // Обновляем parentId для корневых деталей
    childCount: 0,
    children: [],
    },
    {
      id: '1.1',
      name: 'Дверь',
      price: 0,
      quantity: 3,
      cost: 0,
      childCount: 0,
      parentId: '1', // Обновляем parentId для дочерних деталей
      children: [],
    },
    {
      id: '1.1.1',
      name: 'Замок',
      price: 5000,
      quantity: 4,
      cost: 0,
      parentId: '1.1',
      childCount: 0,
      children: [],
    },
    {
      id: '1.1.2',
      name: 'Ручка',
      price: 6000,
      quantity: 6,
      cost: 0,
      parentId: '1.1',
      childCount: 0,
      children: [],
    },
    {
      id: '2',
      name: 'Двигатель',
      price: 0,
      quantity: 1,
      cost: 0,
      parentId: null, // Обновляем parentId для корневых деталей
      childCount: 0,
      children: [],
    },
    {
      id: '2.1',
      name: 'Поршни',
      price: 10000,
      quantity: 5,
      cost: 0,
      childCount: 0,
      parentId: '2', // Обновляем parentId для дочерних деталей
      children: [],
    },
    {
      id: '2.2',
      name: 'Кольца',
      price: 2000,
      quantity: 3,
      cost: 0,
      childCount: 0,
      parentId: '2',
      children: [],
    }
  ]
  childParent(parts);
// Выводим цены деталей
  calculatePrices(parts);
  calculateCosts(parts);
  return parts;
}

export function addNewPart(parts: Part[], parentID: string, newPart: Part): boolean {
  const parentPart = parts.find((part) => part.id === parentID);
//Если parentID совпадает с ID детали, добавляем новую деталь как дочернюю
  if (parentPart) {
    if (!parentPart.children) { //Если у детали еще нет дочерних деталей, создается массив children
      parentPart.children = [];
    }
//Добавляем дочернюю деталь в массив children
    parentPart.children.push(newPart);
//Счетчик дочерних деталей увеличивается
    increaseChildCount(parentPart);
    calculatePrices(parts);
    calculateCosts(parts);
    return true;
  }
  return false;
}