import hikingImg from "@assets/generated_images/men_hiking_through_moody_misty_forest.png";
import mugImg from "@assets/generated_images/close_up_of_hands_holding_a_metal_mug_by_a_fire.png";
import riverImg from "@assets/generated_images/man_sitting_alone_in_contemplation_by_a_river.png";
import heroBg from "@assets/generated_images/moody_deep_forest_landscape_at_twilight.png";
import fireImg from "@assets/generated_images/men_around_a_campfire_at_night.png";
import waterImg from "@assets/generated_images/cold_water_immersion_in_a_dark_lake.png";
import logoImg from "@assets/gw-logo-light-256_1765998189312.png";
import badgeImg from "@assets/gw-badge-400_1765998189310.png";

// Real retreat photos
import coldPlungeCelebration from "@assets/IMG_4320_1766007733128.JPG";
import coldWaterImmersion from "@assets/IMG_4292_1766007733129.JPG";
import fireBuildingPrep from "@assets/IMG_4367_1766007733129.JPG";
import manByFire from "@assets/IMG_4381_1766007733129.JPG";
import groundingOutdoors from "@assets/IMG_4238_1766007733129.JPG";
import handsWithMaterials from "@assets/IMG_4396_1766007733129.JPG";

export const images = {
  hero: heroBg,
  fire: fireImg,
  water: waterImg,
  logo: logoImg,
  badge: badgeImg,
  hiking: hikingImg,
  mug: mugImg,
  river: riverImg,
  // Real retreat photos
  coldPlungeCelebration,
  coldWaterImmersion,
  fireBuildingPrep,
  manByFire,
  groundingOutdoors,
  handsWithMaterials,
};

export const retreats = [
  {
    id: 1,
    title: "The Descent - Winter",
    date: "Dec 8-12, 2025",
    location: "Muskoka, ON",
    price: "$2,400",
    spots: 4,
    image: manByFire,
  },
  {
    id: 2,
    title: "Spring Awakening",
    date: "Mar 15-19, 2026",
    location: "Algonquin, ON",
    price: "$2,400",
    spots: 12,
    image: coldPlungeCelebration,
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
