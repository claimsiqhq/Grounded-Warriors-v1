import heroBg from "@assets/generated_images/moody_deep_forest_landscape_at_twilight.png";
import fireImg from "@assets/generated_images/men_around_a_campfire_at_night.png";
import waterImg from "@assets/generated_images/cold_water_immersion_in_a_dark_lake.png";
import logoImg from "@assets/generated_images/minimalist_tree_roots_logo_symbol.png";

export const images = {
  hero: heroBg,
  fire: fireImg,
  water: waterImg,
  logo: logoImg,
};

export const retreats = [
  {
    id: 1,
    title: "The Descent - Winter",
    date: "Dec 8-12, 2025",
    location: "Olympic Peninsula, WA",
    price: "$2,400",
    spots: 4,
    image: fireImg,
  },
  {
    id: 2,
    title: "Spring Awakening",
    date: "Mar 15-19, 2026",
    location: "Catskills, NY",
    price: "$2,400",
    spots: 12,
    image: heroBg,
  },
];

export const testimonials = [
  {
    text: "I came here looking for a break. I found a brotherhood I didn't know I was starving for.",
    author: "James T.",
  },
  {
    text: "The cold water woke me up. The fire kept me warm. The men kept me honest.",
    author: "Marcus R.",
  },
];
