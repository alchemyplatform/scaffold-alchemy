"use client";
// Wizard data (name, description, image)

export const wizardData = [
  { name: "Hufflepuff", description: "Not a main character", image: "/hufflepuff.jpg", color: "bg-hufflepuff" },
  { name: "Ravenclaw", description: "Pretentious", image: "/ravenclaw.png", color: "bg-ravenclaw" },
  { name: "Gryffindor", description: "Not Slytherin", image: "/gryffindor.jpg", color: "bg-gryffindor" },
  { name: "Slytherin", description: "Goth", image: "/slytherin.jpg", color: "bg-slytherin" },
] as const;

export type WizardData = (typeof wizardData)[number];
