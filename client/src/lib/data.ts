import heroBg from "@assets/generated_images/moody_deep_forest_landscape_at_twilight.png";
import fireImg from "@assets/generated_images/men_around_a_campfire_at_night.png";
import waterImg from "@assets/generated_images/cold_water_immersion_in_a_dark_lake.png";
import logoImg from "@assets/gw-logo-light-256_1765998189312.png";
import badgeImg from "@assets/gw-badge-400_1765998189310.png";

export const images = {
  hero: heroBg,
  fire: fireImg,
  water: waterImg,
  logo: logoImg,
  badge: badgeImg,
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
