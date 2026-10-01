require('dotenv').config();
const mongoose = require('mongoose');
const { Content, Task, TimeBlock, Transaction, Sponsorship, User } = require('./models');

const DEMO_EMAIL = 'demo@creatoros.test';
const DEMO_PASSWORD = 'CreatorOSDemo!2026';

const dateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
};

const monthOffset = (months) => {
  const date = new Date();
  date.setDate(15);
  date.setMonth(date.getMonth() - months);
  date.setHours(12, 0, 0, 0);
  return date;
};

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/creatorOS');

  try {
    let user = await User.findOne({ email: DEMO_EMAIL });
    if (user && !(await user.matchPassword(DEMO_PASSWORD))) {
      throw new Error(`${DEMO_EMAIL} already exists with a different password; no records were changed.`);
    }
    if (!user) {
      user = await User.create({
        fullName: 'Alex Morgan',
        displayName: 'Alex Creates',
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        contentNiche: 'Creator education and productivity',
        preferredBaseCurrency: 'USD'
      });
    }

    const userId = user._id;
    const existingCounts = await Promise.all([
      Content.countDocuments({ userId }),
      Task.countDocuments({ userId }),
      TimeBlock.countDocuments({ userId }),
      Transaction.countDocuments({ userId }),
      Sponsorship.countDocuments({ userId })
    ]);
    if (existingCounts.some(Boolean)) {
      console.log('Demo account already contains data; nothing was added.');
      console.log(`Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
      console.log(`Existing records (content, tasks, time blocks, transactions, sponsorships): ${existingCounts.join(', ')}`);
      return;
    }

    const content = await Content.create([
      { title: 'Build a Creator Weekly Planning System', platform: 'YouTube', stage: 'Published', publishDate: dateOffset(-48) },
      { title: 'Three Editing Shortcuts That Save Hours', platform: 'TikTok', stage: 'Published', publishDate: dateOffset(-18) },
      { title: 'My Minimal Creator Desk Setup', platform: 'Instagram', stage: 'Published', publishDate: dateOffset(-9) },
      { title: 'How I Plan a Month of Videos', platform: 'YouTube', stage: 'Scheduled', publishDate: dateOffset(2) },
      { title: 'A Better Sponsorship Rate Card', platform: 'Blog', stage: 'Editing', publishDate: dateOffset(5) },
      { title: 'Creator Budget Basics in 30 Seconds', platform: 'TikTok', stage: 'Scripting', publishDate: dateOffset(1) },
      { title: 'Workspace Reset and Q&A', platform: 'YouTube', stage: 'Idea' }
    ].map(item => ({ ...item, userId }));

    await Task.create([
      { title: 'Review today’s video outline', userId, contentId: content[3]._id, dueDate: dateOffset(0), priority: 'High', status: 'Active' },
      { title: 'Record the short-form budget tip', userId, contentId: content[5]._id, dueDate: dateOffset(0), priority: 'Medium', status: 'Active' },
      { title: 'Send the sponsor draft for approval', userId, dueDate: dateOffset(1), priority: 'High', status: 'Active' },
      { title: 'Finish first cut for planning video', userId, contentId: content[3]._id, dueDate: dateOffset(-3), priority: 'High', status: 'Active' },
      { title: 'Publish editing shortcuts', userId, contentId: content[1]._id, dueDate: dateOffset(-18), priority: 'Medium', status: 'Completed', completedAt: dateOffset(-18) },
      { title: 'Send last month’s invoice', userId, dueDate: dateOffset(-8), priority: 'Low', status: 'Completed', completedAt: dateOffset(-7) },
      { title: 'Draft the monthly content calendar', userId, dueDate: dateOffset(-5), priority: 'Medium', status: 'Completed', completedAt: dateOffset(-4) },
      { title: 'Collect analytics from all platforms', userId, dueDate: dateOffset(-2), priority: 'Low', status: 'Active' }
    ]);

    await TimeBlock.create([
      { userId, label: 'Plan and prioritize', date: dateOffset(0), startTime: '09:00', endTime: '09:45' },
      { userId, label: 'Film scheduled content', date: dateOffset(0), startTime: '10:00', endTime: '12:00' },
      { userId, label: 'Edit and prepare captions', date: dateOffset(0), startTime: '13:00', endTime: '14:30' },
      { userId, label: 'Weekly content review', date: dateOffset(-7), startTime: '09:00', endTime: '10:00' },
      { userId, label: 'Batch filming', date: dateOffset(-2), startTime: '10:00', endTime: '12:00' },
      { userId, label: 'Review performance metrics', date: dateOffset(-1), startTime: '15:00', endTime: '15:45' }
    ]);

    const incomeByMonth = [1850, 2120, 1980, 2475, 2310, 2860];
    const expenseByMonth = [620, 740, 680, 910, 825, 960];
    const transactions = [];
    for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
      const index = 5 - monthsAgo;
      const date = monthOffset(monthsAgo);
      transactions.push(
        { userId, type: 'Income', amount: incomeByMonth[index], category: 'AdSense', date, description: 'Monthly video revenue' },
        { userId, type: 'Expense', amount: expenseByMonth[index], category: 'Production', date, description: 'Editing, software, and production costs' }
      );
      if (index % 2 === 0) transactions.push({ userId, type: 'Income', amount: 750 + index * 100, category: 'Brand partnerships', date: monthOffset(monthsAgo), description: 'Sponsored creator campaign' });
    }
    transactions.push(
      { userId, type: 'Expense', amount: 189, category: 'Equipment', date: dateOffset(-12), description: 'Microphone accessories' },
      { userId, type: 'Income', amount: 320, category: 'Affiliate', date: dateOffset(-4), description: 'Creator tool referrals' }
    );
    await Transaction.create(transactions);

    await Sponsorship.create([
      { userId, brandName: 'Northstar Audio', dealValue: 2400, deliverables: ['1 YouTube integration', '2 short-form clips'], contractStatus: 'Contract Signed', invoiceStatus: 'Invoiced', dueDate: dateOffset(8) },
      { userId, brandName: 'Frame Studio', dealValue: 1250, deliverables: ['1 Instagram Reel'], contractStatus: 'Negotiating', invoiceStatus: 'Pending', dueDate: dateOffset(14) },
      { userId, brandName: 'MetricFlow', dealValue: 900, deliverables: ['Newsletter feature'], contractStatus: 'Completed', invoiceStatus: 'Overdue', dueDate: dateOffset(-6) }
    ]);

    console.log('Demo data created successfully.');
    console.log(`Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    console.log('Records: 7 content items, 8 tasks, 6 time blocks, 17 transactions, 3 sponsorships.');
  } finally {
    await mongoose.disconnect();
  }
};

main().catch(error => {
  console.error('Could not seed demo data:', error.message);
  process.exitCode = 1;
});
