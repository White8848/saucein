// Mock data shared across screens.

export const SEASONINGS = [
  { key: 'soy_light',  name: '生抽',    short: '抽', color: '#5B3B1F', remain: 78 },
  { key: 'soy_dark',   name: '老抽',    short: '老', color: '#2C1810', remain: 64 },
  { key: 'vinegar',    name: '香醋',    short: '醋', color: '#7B3F2C', remain: 42 },
  { key: 'sugar',      name: '白糖',    short: '糖', color: '#F2EAD8', remain: 88 },
  { key: 'salt',       name: '海盐',    short: '盐', color: '#FFFFFF', remain: 92 },
  { key: 'chili_oil',  name: '辣椒油',  short: '辣', color: '#C53A1A', remain: 35 },
  { key: 'sesame_oil', name: '香油',    short: '麻', color: '#B07A2C', remain: 71 },
  { key: 'oyster',     name: '蚝油',    short: '蚝', color: '#3A2412', remain: 55 },
  { key: 'cooking_w',  name: '料酒',    short: '酒', color: '#C9A86A', remain: 80 },
  { key: 'starch_w',   name: '水淀粉',  short: '淀', color: '#EEEDE6', remain: 90 },
];

export const RECIPES = [
  { id: 'yuxiang',  name: '鱼香肉丝',     english: 'Yu Xiang Rou Si',     category: '川菜',   difficulty: 2, time: 18, tags: ['咸鲜', '微辣', '下饭'], hot: true, hue1: '#A8482A', hue2: '#6B2914', img: import.meta.env.BASE_URL + 'images/yuxiang.jpg' },
  { id: 'boluo',    name: '菠萝咕咾排骨', english: 'Sweet Sour Pork',     category: '粤菜',   difficulty: 2, time: 35, tags: ['酸甜', '开胃'],          hue1: '#C97A2A', hue2: '#5C2A12', img: import.meta.env.BASE_URL + 'images/boluo.jpg' },
  { id: 'suntai',   name: '蒜苔炒肉末',   english: 'Pork & Garlic Stem',  category: '家常',   difficulty: 1, time: 12, tags: ['咸香', '下饭', '快手'],  hue1: '#6B7A3A', hue2: '#3F2814', img: import.meta.env.BASE_URL + 'images/suntai.jpg' },
  { id: 'lemon_x',  name: '酸辣柠檬虾',   english: 'Lemon Chili Shrimp',  category: '东南亚', difficulty: 2, time: 20, tags: ['酸辣', '低脂'],          hue1: '#D4A52A', hue2: '#8C3A20', img: import.meta.env.BASE_URL + 'images/lemon_x.jpg' },
  { id: 'pidan',    name: '皮蛋拌黄瓜',   english: 'Cucumber Salad',      category: '凉菜',   difficulty: 1, time: 5,  tags: ['清爽', '蒜香', '减脂'],  hue1: '#5C8246', hue2: '#3A4A28', img: import.meta.env.BASE_URL + 'images/pidan.jpg' },
  { id: 'shengcai', name: '蒜蓉蚝油生菜', english: 'Oyster Sauce Lettuce', category: '家常',  difficulty: 1, time: 6,  tags: ['鲜', '清淡'],            hue1: '#7AA840', hue2: '#3A5028', img: import.meta.env.BASE_URL + 'images/shengcai.jpg' },
];

// "鱼香" ratio used as the demo recipe across sliders / dispensing.
export const YUXIANG_RATIO = [
  { key: 'soy_light', label: '生抽',   grams: 15, max: 30 },
  { key: 'vinegar',   label: '香醋',   grams: 12, max: 25 },
  { key: 'sugar',     label: '白糖',   grams: 10, max: 25 },
  { key: 'cooking_w', label: '料酒',   grams: 8,  max: 20 },
  { key: 'chili_oil', label: '辣椒油', grams: 6,  max: 20 },
  { key: 'starch_w',  label: '水淀粉', grams: 20, max: 40 },
];

// "Food photo" — layered radial gradients on a hue, used as a placeholder
// when a real .jpg isn't provided.
export function foodBg(r) {
  return (
    `radial-gradient(circle at 30% 30%, ${r.hue2}99, transparent 55%),` +
    `radial-gradient(circle at 78% 70%, ${r.hue1}cc, transparent 60%),` +
    `radial-gradient(circle at 50% 55%, ${r.hue1} 0%, ${r.hue2} 80%)`
  );
}

// Hero background — prefers a real image, falls back to the gradient.
export function heroBg(r) {
  if (r.img) {
    return {
      backgroundImage: `url("${r.img}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: r.hue1,
    };
  }
  return { background: foodBg(r), backgroundColor: r.hue1 };
}
