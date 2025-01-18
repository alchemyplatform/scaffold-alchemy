"use client";
// Wizard data (name, description, image)

export const wizardData = [
  {
    name: "Hufflepuff",
    description: "Not a main character",
    image: "/hufflepuff.jpg",
    color: "bg-hufflepuff-yellow",
    secondaryColor: "bg-hufflepuff-black",
    symbol: "🦡",
  },
  {
    name: "Ravenclaw",
    description: "Pretentious",
    image: "/ravenclaw.jpg",
    color: "bg-ravenclaw-blue",
    secondaryColor: "bg-ravenclaw-bronze",
    symbol: "🦅",
  },
  {
    name: "Gryffindor",
    description: "Not Slytherin",
    image: "/gryffindor.jpg",
    color: "bg-gryffindor-red",
    secondaryColor: "bg-gryffindor-gold",
    symbol: "🦁",
  },
  {
    name: "Slytherin",
    description: "Goth",
    image: "/slytherin.jpg",
    color: "bg-slytherin-green",
    secondaryColor: "bg-slytherin-silver",
    symbol: "🐍",
  },
] as const;

export type WizardData = (typeof wizardData)[number];
