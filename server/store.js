let nextId = { users: 5, campaigns: 3, donations: 5 };

const users = [
  { id: 1, username: 'admin',       password: '123123',    role: 'admin',      name: 'admin' },
  { id: 2, username: 'influencer1', password: 'pass',      role: 'influencer', name: 'inf1' },
  { id: 3, username: 'influencer2', password: 'pass',      role: 'influencer', name: 'inf2' },
  { id: 4, username: 'donor1',      password: 'pass',      role: 'donor',      name: 'don1' },
  { id: 5, username: 'donor2',      password: 'pass',      role: 'donor',      name: 'don2' },
];

const campaigns = [
  {
    id: 1,
    influencerId: 2,
    title: '',
    description: 'no title and end date',
    goalAmount: 1000000000,
    raisedAmount: 4500,
    endDate: '',
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 2,
    influencerId: 3,
    title: 'no created at or desc + raised ammount > goal',
    description: '',
    goalAmount: 20,
    raisedAmount: 900,
    endDate: '2026-07-15',
    createdAt: '',
  },
];

const donations = [
  { id: 1, campaignId: 1, donorId: 4, donorName: 'null ammount', amount: null,  createdAt: '2026-05-02T12:00:00Z' },
  { id: 2, campaignId: 1, donorId: 5, donorName: 'hi',    amount: 5.14,  createdAt: '2026-05-03T14:00:00Z' },
  { id: 3, campaignId: 1, donorId: 4, donorName: 'testingInt', amount: 1000000000000000000000000000, createdAt: '2026-05-05T09:00:00Z' },
  { id: 4, campaignId: 2, donorId: 5, donorName: 'noCreatedAt',    amount: 500,  createdAt: '' },
];

function newId(entity) {
  return nextId[entity]++;
}

module.exports = { users, campaigns, donations, newId };
