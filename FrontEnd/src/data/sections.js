// Order matters: index i is formation i in the neural graph.
export const SECTIONS = [
  { id: "hero", label: "INTRO" },
  { id: "about", label: "ABOUT", nav: true },
  { id: "experience", label: "EXPERIENCE", nav: true },
  { id: "projects-section", label: "WORK", nav: true },
  { id: "contact-section", label: "CONTACT" },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);
