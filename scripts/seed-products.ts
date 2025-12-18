import { getUncachableStripeClient } from '../server/stripeClient';

async function createRetreatProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating retreat products in Stripe...');

  const existingProducts = await stripe.products.search({ 
    query: "metadata['type']:'retreat'" 
  });

  if (existingProducts.data.length > 0) {
    console.log('Retreat products already exist. Skipping creation.');
    console.log('Existing products:', existingProducts.data.map(p => p.name));
    return;
  }

  const winterRetreat = await stripe.products.create({
    name: 'Winter Descent — March 2026',
    description: 'A 3-day immersive retreat in the wilderness featuring cold water therapy, fire ceremonies, breathwork, and men\'s circle work.',
    metadata: {
      type: 'retreat',
      date: 'March 1-3, 2026',
      location: 'Muskoka, Ontario',
      spots: '12'
    }
  });

  await stripe.prices.create({
    product: winterRetreat.id,
    unit_amount: 35000,
    currency: 'cad',
    metadata: {
      type: 'deposit'
    }
  });

  await stripe.prices.create({
    product: winterRetreat.id,
    unit_amount: 145000,
    currency: 'cad',
    metadata: {
      type: 'full'
    }
  });

  console.log(`Created: ${winterRetreat.name}`);

  const springRetreat = await stripe.products.create({
    name: 'Spring Awakening — May 2026',
    description: 'A 3-day immersive retreat focused on renewal, father wound work, and reconnection through nature.',
    metadata: {
      type: 'retreat',
      date: 'May 15-17, 2026',
      location: 'Algonquin, Ontario',
      spots: '12'
    }
  });

  await stripe.prices.create({
    product: springRetreat.id,
    unit_amount: 35000,
    currency: 'cad',
    metadata: {
      type: 'deposit'
    }
  });

  await stripe.prices.create({
    product: springRetreat.id,
    unit_amount: 145000,
    currency: 'cad',
    metadata: {
      type: 'full'
    }
  });

  console.log(`Created: ${springRetreat.name}`);

  const summerRetreat = await stripe.products.create({
    name: 'Summer Solstice — June 2026',
    description: 'A 4-day extended retreat during the longest days of the year. Deep work under the open sky.',
    metadata: {
      type: 'retreat',
      date: 'June 19-22, 2026',
      location: 'Gravenhurst, Ontario',
      spots: '10'
    }
  });

  await stripe.prices.create({
    product: summerRetreat.id,
    unit_amount: 50000,
    currency: 'cad',
    metadata: {
      type: 'deposit'
    }
  });

  await stripe.prices.create({
    product: summerRetreat.id,
    unit_amount: 195000,
    currency: 'cad',
    metadata: {
      type: 'full'
    }
  });

  console.log(`Created: ${summerRetreat.name}`);

  console.log('All retreat products created successfully!');
  console.log('Products will sync to your database automatically via webhooks.');
}

createRetreatProducts().catch(console.error);
