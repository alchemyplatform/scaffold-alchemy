"use client";
// Wizard data (name, description, image)

export const wizardData = [
  {
    name: "Hufflepuff",
    description: "Not a main character",
    image: "/hufflepuff.jpg",
    color: "bg-hufflepuff-yellow",
    secondaryColor: "bg-hufflepuff-black",
  },
  {
    name: "Ravenclaw",
    description: "Pretentious",
    image: "/ravenclaw.png",
    color: "bg-ravenclaw-blue",
    secondaryColor: "bg-ravenclaw-bronze",
  },
  {
    name: "Gryffindor",
    description: "Not Slytherin",
    image: "/gryffindor.jpg",
    color: "bg-gryffindor-red",
    secondaryColor: "bg-gryffindor-gold",
  },
  {
    name: "Slytherin",
    description: "Goth",
    image: "/slytherin.jpg",
    color: "bg-slytherin-green",
    secondaryColor: "bg-slytherin-silver",
  },
] as const;

export type WizardData = (typeof wizardData)[number];
