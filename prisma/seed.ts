import { PrismaClient, Role, FormStatus, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Gradient Forms Development Database Seed...');

  // 1. Create Development User
  const user = await prisma.user.upsert({
    where: { email: 'dev@gradientforms.io' },
    update: {},
    create: {
      id: 'usr-dev-0000-0000-000000000001',
      email: 'dev@gradientforms.io',
      name: 'Developer User',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
  });

  console.log(`👤 Created Dev User: ${user.email} (${user.id})`);

  // 2. Create Development Workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'wsp-dev-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'wsp-dev-0000-0000-000000000001',
      name: 'Acme Product Workspace',
      logo: '⚡',
      plan: 'pro',
    },
  });

  console.log(`🏢 Created Dev Workspace: ${workspace.name} (${workspace.id})`);

  // 3. Link User to Workspace as OWNER
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: Role.OWNER,
    },
  });

  // 4. Create Sample Form
  const form = await prisma.form.upsert({
    where: { id: 'frm-dev-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'frm-dev-0000-0000-000000000001',
      workspaceId: workspace.id,
      authorId: user.id,
      title: 'Customer Experience & Product Feedback',
      description: 'Help us improve Gradient Forms by sharing your feedback.',
      status: FormStatus.PUBLISHED,
      isPublished: true,
      settingsJson: {
        allowMultipleSubmissions: true,
        showProgressBar: true,
        quizMode: false,
      },
      themeJson: {
        id: 'neo-blue',
        name: 'Neo Tech Blue',
        primaryColor: '#2563EB',
        accentColor: '#38BDF8',
        backgroundColor: '#0B0F14',
      },
    },
  });

  console.log(`📝 Created Sample Form: ${form.title} (${form.id})`);

  // 5. Create Questions
  const q1 = await prisma.question.upsert({
    where: { id: 'qst-dev-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'qst-dev-0000-0000-000000000001',
      formId: form.id,
      type: QuestionType.MULTIPLE_CHOICE,
      title: 'What is your primary engineering role?',
      required: true,
      orderIndex: 0,
      options: {
        create: [
          { label: 'Developer / Engineer', orderIndex: 0 },
          { label: 'Product Manager', orderIndex: 1 },
          { label: 'UX Designer', orderIndex: 2 },
        ],
      },
    },
  });

  const q2 = await prisma.question.upsert({
    where: { id: 'qst-dev-0000-0000-000000000002' },
    update: {},
    create: {
      id: 'qst-dev-0000-0000-000000000002',
      formId: form.id,
      type: QuestionType.RATING,
      title: 'Rate the visual quality of the 3D Form Builder:',
      ratingMax: 5,
      required: true,
      orderIndex: 1,
    },
  });

  console.log(`❓ Created Questions: Q1 (${q1.id}), Q2 (${q2.id})`);

  // 6. Create Logic Rule
  await prisma.logicRule.upsert({
    where: { id: 'lgr-dev-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'lgr-dev-0000-0000-000000000001',
      formId: form.id,
      sourceQuestionId: q1.id,
      operator: 'equals',
      value: 'Developer / Engineer',
      action: 'SHOW_QUESTION',
      targetQuestionId: q2.id,
    },
  });

  // 7. Create Sample Responses
  const response1 = await prisma.formResponse.upsert({
    where: { id: 'rsp-dev-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'rsp-dev-0000-0000-000000000001',
      formId: form.id,
      respondentEmail: 'alex@company.com',
      respondentName: 'Alex Rivera',
      timeSpentSeconds: 105,
      answers: {
        create: [
          { questionId: q1.id, valueJson: 'Developer / Engineer' },
          { questionId: q2.id, valueJson: 5 },
        ],
      },
    },
  });

  console.log(`📊 Created Sample Response: (${response1.id})`);
  console.log('✅ Development Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
