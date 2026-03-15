const ANIMAL_ICON_BASE_PATH = "../../../assets/icons/animals";

type AnimalIconFileName =
  | "panda"
  | "eagles"
  | "gorilla"
  | "lemur"
  | "alligator"
  | "crocodile"
  | "koala"
  | "lion"
  | "tiger"
  | "elephant"
  | "sea-otter"
  | "wolf"
  | "fox"
  | "bear"
  | "dolphin"
  | "leopard"
  | "jaguar"
  | "rhinoceros"
  | "macaw"
  | "komodo-dragon"
  | "sloth"
  | "cheetah";

interface IAnimalIconRule {
  keywords: string[];
  fileName: AnimalIconFileName;
}

const ANIMAL_ICON_RULES: IAnimalIconRule[] = [
  {
    keywords: ["sea otter", "otter"],
    fileName: "sea-otter",
  },
  {
    keywords: ["komodo dragon"],
    fileName: "komodo-dragon",
  },
  {
    keywords: ["ring-tailed lemur", "ring tailed lemur", "lemur"],
    fileName: "lemur",
  },
  {
    keywords: ["bald eagles", "bald eagle", "eagles", "eagle"],
    fileName: "eagles",
  },
  {
    keywords: ["red panda", "panda"],
    fileName: "panda",
  },
  {
    keywords: ["mountain gorilla", "gorilla"],
    fileName: "gorilla",
  },
  {
    keywords: ["alligator"],
    fileName: "alligator",
  },
  {
    keywords: ["saltwater crocodile", "crocodile"],
    fileName: "crocodile",
  },
  {
    keywords: ["koala"],
    fileName: "koala",
  },
  {
    keywords: ["african lion", "lion"],
    fileName: "lion",
  },
  {
    keywords: ["sumatran tiger", "bengal tiger", "tiger"],
    fileName: "tiger",
  },
  {
    keywords: ["elephant"],
    fileName: "elephant",
  },
  {
    keywords: ["gray wolf", "wolf"],
    fileName: "wolf",
  },
  {
    keywords: ["fennec fox", "arctic fox", "fox"],
    fileName: "fox",
  },
  {
    keywords: ["polar bear", "grizzly bear", "bear"],
    fileName: "bear",
  },
  {
    keywords: ["bottlenose dolphin", "dolphin"],
    fileName: "dolphin",
  },
  {
    keywords: ["snow leopard", "leopard"],
    fileName: "leopard",
  },
  {
    keywords: ["jaguar"],
    fileName: "jaguar",
  },
  {
    keywords: ["white rhinoceros", "rhinoceros", "rhino"],
    fileName: "rhinoceros",
  },
  {
    keywords: ["scarlet macaw", "macaw"],
    fileName: "macaw",
  },
  {
    keywords: ["sloth"],
    fileName: "sloth",
  },
  {
    keywords: ["cheetah"],
    fileName: "cheetah",
  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function createIconPath(fileName: AnimalIconFileName): string {
  const img = new URL(`${import.meta.env.BASE_URL}assets/icons/animals/${fileName}.svg`, import.meta.url).href;
  console.log(img);
  return img; // `${ANIMAL_ICON_BASE_PATH}/${fileName}.svg`;
}

export function getAnimalIconByText(text: string): string | null {
  const normalizedText = normalizeText(text);

  const matchedRule = ANIMAL_ICON_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalizedText.includes(keyword))
  );

  return matchedRule ? createIconPath(matchedRule.fileName) : null;
}
