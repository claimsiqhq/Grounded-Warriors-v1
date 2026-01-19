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

// July 2025 retreat photos
import julyGroupIndoor from "@assets/IMG_7190_1766009456061.PNG";
import julyGroupForest from "@assets/1bcda273-0203-4b6a-867d-4e2fadf1cb0e_1766010770474.JPG";
import julyCommunalMeal from "@assets/IMG_2841_1766010770475.JPG";
import julyLakeSauna from "@assets/IMG_2843_1766010770475.JPG";
import julyColdPlunge from "@assets/febb25ac-27e4-43b8-9ff9-e676a71caf6e_1766010770475.JPG";
import julyTipi from "@assets/IMG_2831_1766010770475.JPG";
import julyGroupDeck from "@assets/IMG_2832_1766010770475.JPG";

// May 2025 retreat photos
import mayCircle from "@assets/DSC03480_1766011513258.JPG";
import mayForestWalk from "@assets/DSC03647_1766011513259.JPG";
import mayColdPlunge from "@assets/DSC03772_1766011513259.JPG";
import mayLogBalance from "@assets/DSC03683_1766011513259.JPG";
import mayConversation from "@assets/DSC03458_1766011513259.JPG";
import mayMeditation from "@assets/DSC03744_1766011513259.JPG";

// March 2025 retreat photos
import marchIcePlunge from "@assets/PXL_20250309_141603234.MP_1766011933410.jpg";
import marchSauna from "@assets/20250308_084333_1766011948997.jpg";
import marchRest from "@assets/20250308_182718_1766011948998.jpg";
import marchSnowTraining from "@assets/IMG_4074_1766011897386.JPG";
import marchWinterHike from "@assets/IMG_4108_1766011897387.JPG";
import marchContemplation from "@assets/IMG_4127_1766011897387.JPG";
import johnPhoto from "@assets/IMG_4118_1766062885957.jpeg";
import rawaPhoto from "@assets/Rawa_Bo_PHoto_1768788413370.jpeg";
import chrisPhoto from "@assets/Chris_Bio_Photo_1768788413370.jpeg";

// Driftwood Paddle photos for Spring Awakening
import driftwoodHero from "@assets/driftwood_photos/hero_canoe.jpg";
import driftwoodSunset from "@assets/driftwood_photos/sunset_lake.jpg";
import driftwoodGroup from "@assets/driftwood_photos/group_canoes.png";
import driftwoodPaddling from "@assets/driftwood_photos/paddling.jpg";
import driftwoodCampfire from "@assets/driftwood_photos/campfire_cooking.jpg";
import driftwoodTent from "@assets/driftwood_photos/tent_camp.jpg";
import driftwoodMist from "@assets/driftwood_photos/morning_mist.jpg";
import driftwoodPortage from "@assets/driftwood_photos/portage.jpg";
import driftwoodReflection from "@assets/driftwood_photos/water_reflection.jpg";
import driftwoodForest from "@assets/driftwood_photos/forest_path.jpg";

export const images = {
  hero: heroBg,
  fire: fireImg,
  water: waterImg,
  logo: logoImg,
  badge: badgeImg,
  hiking: hikingImg,
  mug: mugImg,
  river: riverImg,
  // Real retreat photos - November 2025
  coldPlungeCelebration,
  coldWaterImmersion,
  fireBuildingPrep,
  manByFire,
  groundingOutdoors,
  handsWithMaterials,
  // July 2025 retreat photos
  julyGroupIndoor,
  julyGroupForest,
  julyCommunalMeal,
  julyLakeSauna,
  julyColdPlunge,
  julyTipi,
  julyGroupDeck,
  // May 2025 retreat photos
  mayCircle,
  mayForestWalk,
  mayColdPlunge,
  mayLogBalance,
  mayConversation,
  mayMeditation,
  // March 2025 retreat photos
  marchIcePlunge,
  marchSauna,
  marchRest,
  marchSnowTraining,
  marchWinterHike,
  marchContemplation,
  // Driftwood Paddle / Spring Awakening photos
  driftwoodHero,
  driftwoodSunset,
  driftwoodGroup,
  driftwoodPaddling,
  driftwoodCampfire,
  driftwoodTent,
  driftwoodMist,
  driftwoodPortage,
  driftwoodReflection,
  driftwoodForest,
};

export const springRetreatGallery = [
  { src: driftwoodHero, alt: "Canoe on the lake at sunrise" },
  { src: driftwoodGroup, alt: "Group paddling together" },
  { src: driftwoodPaddling, alt: "Paddling through Algonquin" },
  { src: driftwoodCampfire, alt: "Cooking over the campfire" },
  { src: driftwoodMist, alt: "Morning mist on the water" },
  { src: driftwoodPortage, alt: "Portaging through the forest" },
  { src: driftwoodReflection, alt: "Still water reflections" },
  { src: driftwoodForest, alt: "Forest pathway" },
  { src: driftwoodSunset, alt: "Sunset over the lake" },
  { src: driftwoodTent, alt: "Backcountry campsite" },
];

export const retreats = [
  {
    id: 1,
    title: "Winter Descent",
    date: "March 2026",
    location: "Marmora, ON",
    image: marchIcePlunge,
    depositAmount: 250,
    fullAmount: 555,
  },
  {
    id: 2,
    title: "Spring Awakening",
    date: "May 2026",
    location: "Algonquin Park, ON",
    image: mayColdPlunge,
    depositAmount: 250,
    fullAmount: 2500,
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
  {
    text: "For the first time in years, I felt permission to just be. No performance. No mask. Just presence.",
    author: "David K.",
  },
  {
    text: "The descent changed everything. I returned home a different man—more grounded, more alive.",
    author: "Andrew P.",
  },
];

export const facilitators = [
  {
    name: "John Shoust",
    role: "Co-Founder & Facilitator",
    bio: "Lifelong wilderness lover, off-grid expert, endurance athlete, and entrepreneur. With degrees spanning engineering, business, and psychology, John brings deep knowledge to both the physical and mental aspects of the retreats. A longtime practitioner and facilitator of cold therapy, he guides men through challenge with grounded presence.",
    image: johnPhoto,
  },
  {
    name: "Brian Coones",
    role: "Co-Founder & Facilitator",
    bio: "Brian has spent over a decade guiding men through transformative experiences in the wilderness. His approach combines cold water therapy, somatic practices, breathwork, and ancient fire ceremony traditions. A certified facilitator, he creates space for men to reconnect with their bodies and find strength through surrender.",
    image: marchWinterHike,
  },
];

export const springRetreatHosts = [
  {
    name: "John Shoust",
    role: "Co-Founder & Facilitator",
    bio: "Lifelong wilderness lover, off-grid expert, endurance athlete, and entrepreneur. With degrees spanning engineering, business, and psychology, John brings deep knowledge to both the physical and mental aspects of the retreats. A longtime practitioner and facilitator of cold therapy, he guides men through challenge with grounded presence.",
    image: johnPhoto,
  },
  {
    name: "Brian Coones",
    role: "Co-Founder & Facilitator",
    bio: "Brian has spent over a decade guiding men through transformative experiences in the wilderness. His approach combines cold water therapy, somatic practices, breathwork, and ancient fire ceremony traditions. A certified facilitator, he creates space for men to reconnect with their bodies and find strength through surrender.",
    image: marchWinterHike,
  },
  {
    name: "Rawa",
    role: "Facilitator",
    bio: "Founder of Bold & Centered, a men's empowerment movement devoted to the awakening of men's hearts. Rawa guides men through initiatory processes that restore sacred brotherhood and embodied leadership, cultivating safety through somatic practices and ritual.",
    image: rawaPhoto,
  },
  {
    name: "Chris",
    role: "Wilderness Guide",
    bio: "World traveler, dreamer, coach, and guide of 12 years. Chris's deep love for nature and ability to connect with people creates an environment that encourages exploration, openness, and deep reflection. His mission is to be the bridge between society and the natural world.",
    image: chrisPhoto,
  },
];
