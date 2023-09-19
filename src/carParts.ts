export interface Part {
  id: string;
  name: string;
  price: number;
  quantity: number;
  childCount: number; // Счетчик дочерних деталей
  children?: Part[]; // Дочерние детали
}

function increaseChildCount(part: Part) {
  part.childCount++;
  if (part.children && part.children.length > 0) {
    for (const child of part.children) {
      increaseChildCount(child);
    }
  }
}

export function decreaseChildCount(part: Part) {
  part.childCount--;
  if (part.children && part.children.length > 0) {
    for (const child of part.children) {
      decreaseChildCount(child);
    }
  }
}

export function calculatePrices(parts: Part[]): void {
  for (const part of parts) {
    // Если деталь имеет дочерние детали, рассчитываем их сначала
    if (part.children && part.children.length > 0) {
      calculatePrices(part.children);
    }

    // Вычисляем цену текущей детали на основе дочерних деталей
    part.price = calculateTotalPrice(part);
  }
}

function calculateTotalPrice(part: Part): number {
  if (!part.children || part.children.length === 0) {
    // Если у детали нет дочерних деталей, то ее цена равна price * quantity
    return part.price * part.quantity;
  } else {
    // Если у детали есть дочерние детали, вычисляем их цены и суммируем
    let totalPrice = 0;
    for (const child of part.children) {
      totalPrice += calculateTotalPrice(child);
    }
    return totalPrice;
  }
}

export function getCarParts(): Part[] {
  const parts: Part[] = [
    {
      id: '1',
      name: 'Кузов',
      price: 0, // Изначально цена будет равна 0
      quantity: 1,
      childCount: 0,
      children: [
        {
          id: '1.1',
          name: 'Дверь',
          price: 0,
          quantity: 1,
          childCount: 0,
          children: [
            {
              id: '1.1.1',
              name: 'Замок',
              price: 5000,
              quantity: 4,
              childCount: 0,
            },
            {
              id: '1.1.2',
              name: 'Ручка',
              price: 6000,
              quantity: 6,
              childCount: 0,
            },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Двигатель',
      price: 0,
      quantity: 1,
      childCount: 0,
      children: [
        {
          id: '2.1',
          name: 'Поршни',
          price: 10000,
          quantity: 5,
          childCount: 0,
        },
        {
          id: '2.2',
          name: 'Кольца',
          price: 2000,
          quantity: 3,
          childCount: 0,
        },
      ],
    },
    // Добавьте другие корневые детали, если необходимо
  ];

  // Вычисляем цены деталей
  calculatePrices(parts);

  return parts;
}

export function addNewPart(parts: Part[], parentID: string, newPart: Part): boolean {
  for (const part of parts) {
    if (part.id === parentID) {
      // Родительская деталь
      if (!part.children) {
        part.children = [];
      }
      part.children.push(newPart);
      increaseChildCount(part);
      return true;
    } else if (part.children && part.children.length > 0) {
      const added = addNewPart(part.children, parentID, newPart);
      if (added) {
        increaseChildCount(part);
        return true;
      }
    }
  }
  return false;
}
