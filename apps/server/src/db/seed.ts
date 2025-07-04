import * as bcrypt from 'bcryptjs';
import { db } from './index';
import { expenses, groups, subscriptions, users, usersToGroups, usersToSubscriptions } from './schema';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (be careful in production!)
  await db.delete(expenses);
  await db.delete(usersToSubscriptions);
  await db.delete(usersToGroups);
  await db.delete(subscriptions);
  await db.delete(groups);
  await db.delete(users);
  
  console.log('🧹 Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const [user1, user2, user3, user4] = await db.insert(users).values([
    {
      fullName: 'João Silva',
      email: 'joao@exemplo.com',
      password: hashedPassword,
    },
    {
      fullName: 'Maria Santos',
      email: 'maria@exemplo.com',
      password: hashedPassword,
    },
    {
      fullName: 'Pedro Costa',
      email: 'pedro@exemplo.com',
      password: hashedPassword,
    },
    {
      fullName: 'Ana Oliveira',
      email: 'ana@exemplo.com',
      password: hashedPassword,
    },
  ]).returning();

  console.log('✅ Users created');

  // Create groups
  const [group1, group2] = await db.insert(groups).values([
    {
      name: 'Família Silva',
      description: 'Compartilhamento de assinaturas da família',
      ownerId: user1.id,
    },
    {
      name: 'Amigos da Faculdade',
      description: 'Grupo para dividir custos de streaming',
      ownerId: user2.id,
    },
  ]).returning();

  console.log('✅ Groups created');

  // Add users to groups
  await db.insert(usersToGroups).values([
    // Grupo 1 - Família Silva
    { userId: user1.id, groupId: group1.id, role: 'admin' },
    { userId: user2.id, groupId: group1.id, role: 'member' },
    { userId: user3.id, groupId: group1.id, role: 'member' },
    
    // Grupo 2 - Amigos da Faculdade
    { userId: user2.id, groupId: group2.id, role: 'admin' },
    { userId: user3.id, groupId: group2.id, role: 'member' },
    { userId: user4.id, groupId: group2.id, role: 'member' },
  ]);

  console.log('✅ Users added to groups');

  // Create subscriptions
  const [netflix, spotify, disneyPlus, amazonPrime, youtube] = await db.insert(subscriptions).values([
    {
      name: 'Netflix',
      iconUrl: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/227_Netflix_logo-512.png',
      totalCost: 4490, // R$ 44.90 in cents
      maxMembers: 4,
      isPublic: false,
      ownerId: user1.id,
      groupId: group1.id,
    },
    {
      name: 'Spotify Family',
      iconUrl: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/315_Spotify_logo-512.png',
      totalCost: 2690, // R$ 26.90 in cents
      maxMembers: 6,
      isPublic: false,
      ownerId: user1.id,
      groupId: group1.id,
    },
    {
      name: 'Disney Plus',
      iconUrl: 'https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/disney_plus-512.png',
      totalCost: 2790, // R$ 27.90 in cents
      maxMembers: 4,
      isPublic: true,
      ownerId: user2.id,
      groupId: group2.id,
    },
    {
      name: 'Amazon Prime Video',
      iconUrl: 'https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/amazon_prime_video-512.png',
      totalCost: 1990, // R$ 19.90 in cents
      maxMembers: 3,
      isPublic: true,
      ownerId: user3.id,
      groupId: null, // Independent subscription
    },
    {
      name: 'YouTube Premium',
      iconUrl: 'https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/youtube-512.png',
      totalCost: 2390, // R$ 23.90 in cents
      maxMembers: 5,
      isPublic: true,
      ownerId: user4.id,
      groupId: null, // Independent subscription
    },
  ]).returning();

  console.log('✅ Subscriptions created');

  // Add users to subscriptions
  await db.insert(usersToSubscriptions).values([
    // Netflix - Família Silva
    { userId: user1.id, subscriptionId: netflix.id },
    { userId: user2.id, subscriptionId: netflix.id },
    { userId: user3.id, subscriptionId: netflix.id },

    // Spotify - Família Silva
    { userId: user1.id, subscriptionId: spotify.id },
    { userId: user2.id, subscriptionId: spotify.id },

    // Disney Plus - Amigos da Faculdade
    { userId: user2.id, subscriptionId: disneyPlus.id },
    { userId: user3.id, subscriptionId: disneyPlus.id },
    { userId: user4.id, subscriptionId: disneyPlus.id },

    // Amazon Prime - Independent
    { userId: user3.id, subscriptionId: amazonPrime.id },
    { userId: user1.id, subscriptionId: amazonPrime.id },

    // YouTube Premium - Independent
    { userId: user4.id, subscriptionId: youtube.id },
    { userId: user2.id, subscriptionId: youtube.id },
  ]);

  console.log('✅ Users added to subscriptions');

  // Create sample expenses
  await db.insert(expenses).values([
    {
      subscriptionId: netflix.id,
      userId: user1.id,
      description: 'Renovação mensal Netflix',
      amount: 4490, // R$ 44.90 in cents
      category: 'Renovação',
      date: new Date('2024-01-15'),
    },
    {
      subscriptionId: spotify.id,
      userId: user1.id,
      description: 'Upgrade para Premium',
      amount: 1000, // R$ 10.00 in cents
      category: 'Upgrade',
      date: new Date('2024-01-20'),
    },
    {
      subscriptionId: disneyPlus.id,
      userId: user2.id,
      description: 'Taxa de cancelamento',
      amount: 500, // R$ 5.00 in cents
      category: 'Multa',
      date: new Date('2024-01-25'),
    },
    {
      subscriptionId: amazonPrime.id,
      userId: user3.id,
      description: 'Renovação anual',
      amount: 1990, // R$ 19.90 in cents
      category: 'Renovação',
      date: new Date('2024-02-01'),
    },
    {
      subscriptionId: youtube.id,
      userId: user4.id,
      description: 'Taxa extra por dispositivo',
      amount: 799, // R$ 7.99 in cents
      category: 'Taxa Extra',
      date: new Date('2024-02-05'),
    },
  ]);

  console.log('✅ Sample expenses created');

  console.log('🎉 Database seed completed successfully!');
  
  console.log('\n📝 Test accounts created:');
  console.log('Email: joao@exemplo.com | Password: 123456');
  console.log('Email: maria@exemplo.com | Password: 123456');
  console.log('Email: pedro@exemplo.com | Password: 123456');
  console.log('Email: ana@exemplo.com | Password: 123456');
  
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});