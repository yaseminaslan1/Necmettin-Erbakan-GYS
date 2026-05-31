const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Clear existing data (in reverse order of dependencies)
  await knex('task_comments').del();
  await knex('task_attachments').del();
  await knex('tasks').del();
  await knex('workflow_stages').del();
  await knex('project_members').del();
  await knex('projects').del();
  await knex('refresh_tokens').del();
  await knex('user_roles').whereNot('user_id', 1).del(); // Keep admin user role
  await knex('users').whereNot('id', 1).del(); // Keep admin user

  const hashedPassword = await bcrypt.hash('Test123!', 10);

  // Fresh installations may not have the default admin yet.
  // Ensure admin user (id: 1) exists before creating FK-dependent sample records.
  const existingAdmin = await knex('users').where({ id: 1 }).first();
  if (!existingAdmin) {
    await knex('users').insert({
      id: 1,
      email: 'sukrukemuk@gmail.com',
      password: hashedPassword,
      name: 'Admin User',
      provider: 'local',
      is_active: true,
      email_verified_at: new Date(),
    });
  }

  const adminRole = await knex('roles').where({ name: 'admin' }).first();
  if (adminRole) {
    const hasAdminRole = await knex('user_roles')
      .where({ user_id: 1, role_id: adminRole.id })
      .first();

    if (!hasAdminRole) {
      await knex('user_roles').insert({ user_id: 1, role_id: adminRole.id });
    }
  }

  // Create sample users
  const users = [
    {
      id: 2,
      email: 'pm@test.com',
      password: hashedPassword,
      name: 'Ahmet Yılmaz',
      provider: 'local',
      is_active: true,
      email_verified_at: new Date(),
    },
    {
      id: 3,
      email: 'dev1@test.com',
      password: hashedPassword,
      name: 'Mehmet Kaya',
      provider: 'local',
      is_active: true,
      email_verified_at: new Date(),
    },
    {
      id: 4,
      email: 'dev2@test.com',
      password: hashedPassword,
      name: 'Ayşe Demir',
      provider: 'local',
      is_active: true,
      email_verified_at: new Date(),
    },
    {
      id: 5,
      email: 'viewer@test.com',
      password: hashedPassword,
      name: 'Fatma Çelik',
      provider: 'local',
      is_active: true,
      email_verified_at: new Date(),
    },
  ];

  await knex('users').insert(users);

  // Get role IDs
  const roles = await knex('roles').select('id', 'name');
  const roleMap = {};
  roles.forEach(r => roleMap[r.name] = r.id);

  // Assign roles to users
  const userRoles = [
    { user_id: 2, role_id: roleMap['project_manager'] },
    { user_id: 3, role_id: roleMap['developer'] },
    { user_id: 4, role_id: roleMap['developer'] },
    { user_id: 5, role_id: roleMap['viewer'] },
  ];

  await knex('user_roles').insert(userRoles);

  // Create sample projects
  const projects = [
    {
      id: 1,
      name: 'E-Ticaret Platformu',
      description: 'Modern e-ticaret web uygulaması geliştirme projesi. React frontend, Node.js backend.',
      color: '#3b82f6',
      owner_id: 2, // PM owns this
      status: 'active',
    },
    {
      id: 2,
      name: 'Mobil Uygulama',
      description: 'iOS ve Android için cross-platform mobil uygulama. React Native kullanılacak.',
      color: '#10b981',
      owner_id: 2,
      status: 'active',
    },
    {
      id: 3,
      name: 'API Geliştirme',
      description: 'RESTful API servisleri ve mikroservis mimarisi tasarımı.',
      color: '#8b5cf6',
      owner_id: 1, // Admin owns this
      status: 'active',
    },
  ];

  await knex('projects').insert(projects);

  // Create workflow stages for each project
  const defaultStages = [
    { name: 'Backlog', color: '#6b7280', order_index: 0, is_default: true, is_completed: false },
    { name: 'To Do', color: '#3b82f6', order_index: 1, is_default: false, is_completed: false },
    { name: 'In Progress', color: '#f59e0b', order_index: 2, is_default: false, is_completed: false },
    { name: 'Review', color: '#8b5cf6', order_index: 3, is_default: false, is_completed: false },
    { name: 'Done', color: '#10b981', order_index: 4, is_default: false, is_completed: true },
  ];

  const allStages = [];
  let stageId = 1;
  
  for (const project of projects) {
    for (const stage of defaultStages) {
      allStages.push({
        id: stageId++,
        project_id: project.id,
        ...stage,
      });
    }
  }

  await knex('workflow_stages').insert(allStages);

  // Add project members
  const projectMembers = [
    // E-Ticaret Platformu members
    { project_id: 1, user_id: 3, role_id: roleMap['developer'] },
    { project_id: 1, user_id: 4, role_id: roleMap['developer'] },
    { project_id: 1, user_id: 5, role_id: roleMap['viewer'] },
    // Mobil Uygulama members
    { project_id: 2, user_id: 3, role_id: roleMap['developer'] },
    { project_id: 2, user_id: 4, role_id: roleMap['developer'] },
    // API Geliştirme members
    { project_id: 3, user_id: 2, role_id: roleMap['project_manager'] },
    { project_id: 3, user_id: 3, role_id: roleMap['developer'] },
  ];

  await knex('project_members').insert(projectMembers);

  // Helper to get stage ID
  const getStageId = (projectId, stageName) => {
    return allStages.find(s => s.project_id === projectId && s.name === stageName)?.id;
  };

  // Create sample tasks
  const now = new Date();
  const addDays = (days) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    return date;
  };
  const subDays = (days) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date;
  };

  const tasks = [
    // E-Ticaret Platformu Tasks
    {
      project_id: 1,
      stage_id: getStageId(1, 'Done'),
      title: 'Veritabanı şeması tasarımı',
      description: 'MySQL veritabanı tablolarının ve ilişkilerinin tasarlanması',
      priority: 'high',
      assignee_id: 3,
      creator_id: 2,
      due_date: subDays(5),
      order_index: 0,
      completed_at: subDays(3),
    },
    {
      project_id: 1,
      stage_id: getStageId(1, 'Done'),
      title: 'Kullanıcı authentication sistemi',
      description: 'JWT tabanlı kimlik doğrulama sistemi implementasyonu',
      priority: 'high',
      assignee_id: 3,
      creator_id: 2,
      due_date: subDays(3),
      order_index: 1,
      completed_at: subDays(1),
    },
    {
      project_id: 1,
      stage_id: getStageId(1, 'Review'),
      title: 'Ürün listeleme sayfası',
      description: 'Ürünlerin grid/list görünümü, filtreleme ve sıralama özellikleri',
      priority: 'medium',
      assignee_id: 4,
      creator_id: 2,
      due_date: addDays(2),
      order_index: 0,
    },
    {
      project_id: 1,
      stage_id: getStageId(1, 'In Progress'),
      title: 'Sepet sistemi',
      description: 'Alışveriş sepeti ekleme, çıkarma, güncelleme işlemleri',
      priority: 'high',
      assignee_id: 3,
      creator_id: 2,
      due_date: addDays(5),
      order_index: 0,
    },
    {
      project_id: 1,
      stage_id: getStageId(1, 'In Progress'),
      title: 'Ödeme entegrasyonu',
      description: 'Stripe/PayPal ödeme gateway entegrasyonu',
      priority: 'high',
      assignee_id: 4,
      creator_id: 2,
      due_date: addDays(7),
      order_index: 1,
    },
    {
      project_id: 1,
      stage_id: getStageId(1, 'To Do'),
      title: 'Admin paneli',
      description: 'Ürün, sipariş ve kullanıcı yönetimi için admin arayüzü',
      priority: 'medium',
      assignee_id: 3,
      creator_id: 2,
      due_date: addDays(14),
      order_index: 0,
    },
    {
      project_id: 1,
      stage_id: getStageId(1, 'To Do'),
      title: 'Email bildirimleri',
      description: 'Sipariş onayı, kargo takibi için email şablonları',
      priority: 'low',
      assignee_id: 4,
      creator_id: 2,
      due_date: addDays(21),
      order_index: 1,
    },
    {
      project_id: 1,
      stage_id: getStageId(1, 'Backlog'),
      title: 'Performans optimizasyonu',
      description: 'Sayfa yükleme hızı ve API response time iyileştirmeleri',
      priority: 'low',
      assignee_id: null,
      creator_id: 2,
      due_date: null,
      order_index: 0,
    },
    // Geciken görev
    {
      project_id: 1,
      stage_id: getStageId(1, 'In Progress'),
      title: 'Responsive tasarım düzenlemeleri',
      description: 'Mobil ve tablet uyumluluğu için CSS düzenlemeleri',
      priority: 'medium',
      assignee_id: 4,
      creator_id: 2,
      due_date: subDays(2), // Gecikmiş!
      order_index: 2,
    },

    // Mobil Uygulama Tasks
    {
      project_id: 2,
      stage_id: getStageId(2, 'Done'),
      title: 'Proje kurulumu',
      description: 'React Native proje yapısı ve bağımlılıkların kurulumu',
      priority: 'high',
      assignee_id: 3,
      creator_id: 2,
      due_date: subDays(10),
      order_index: 0,
      completed_at: subDays(8),
    },
    {
      project_id: 2,
      stage_id: getStageId(2, 'In Progress'),
      title: 'Ana sayfa UI',
      description: 'Ana sayfa tasarımı ve componentlerin oluşturulması',
      priority: 'medium',
      assignee_id: 4,
      creator_id: 2,
      due_date: addDays(3),
      order_index: 0,
    },
    {
      project_id: 2,
      stage_id: getStageId(2, 'To Do'),
      title: 'Push notification sistemi',
      description: 'Firebase Cloud Messaging entegrasyonu',
      priority: 'medium',
      assignee_id: 3,
      creator_id: 2,
      due_date: addDays(10),
      order_index: 0,
    },
    {
      project_id: 2,
      stage_id: getStageId(2, 'Backlog'),
      title: 'Offline mode desteği',
      description: 'İnternet bağlantısı olmadan çalışabilme özelliği',
      priority: 'low',
      assignee_id: null,
      creator_id: 2,
      due_date: null,
      order_index: 0,
    },

    // API Geliştirme Tasks
    {
      project_id: 3,
      stage_id: getStageId(3, 'Done'),
      title: 'API dokümantasyonu',
      description: 'Swagger/OpenAPI ile API dokümantasyonu hazırlanması',
      priority: 'high',
      assignee_id: 3,
      creator_id: 1,
      due_date: subDays(7),
      order_index: 0,
      completed_at: subDays(5),
    },
    {
      project_id: 3,
      stage_id: getStageId(3, 'Review'),
      title: 'Rate limiting implementasyonu',
      description: 'API isteklerinde rate limiting ve throttling',
      priority: 'high',
      assignee_id: 3,
      creator_id: 1,
      due_date: addDays(1),
      order_index: 0,
    },
    {
      project_id: 3,
      stage_id: getStageId(3, 'In Progress'),
      title: 'Caching stratejisi',
      description: 'Redis ile API response caching',
      priority: 'medium',
      assignee_id: 3,
      creator_id: 1,
      due_date: addDays(5),
      order_index: 0,
    },
    {
      project_id: 3,
      stage_id: getStageId(3, 'To Do'),
      title: 'API versiyonlama',
      description: 'v1, v2 gibi API versiyon yönetimi',
      priority: 'low',
      assignee_id: null,
      creator_id: 1,
      due_date: addDays(20),
      order_index: 0,
    },
  ];

  await knex('tasks').insert(tasks);

  // Get inserted task IDs
  const insertedTasks = await knex('tasks').select('id', 'title');
  const getTaskId = (title) => insertedTasks.find(t => t.title === title)?.id;

  // Add some task comments
  const taskComments = [
    {
      task_id: getTaskId('Ürün listeleme sayfası'),
      user_id: 2,
      content: 'Filtreleme için Redux kullanmayı düşünelim.',
    },
    {
      task_id: getTaskId('Ürün listeleme sayfası'),
      user_id: 4,
      content: 'Tamam, state management için Redux Toolkit ekledim.',
    },
    {
      task_id: getTaskId('Sepet sistemi'),
      user_id: 3,
      content: 'LocalStorage ile sepet verilerini saklıyorum.',
    },
    {
      task_id: getTaskId('Ödeme entegrasyonu'),
      user_id: 2,
      content: 'Stripe test API keyleri hazır, sandbox ortamında test edebilirsiniz.',
    },
  ].filter(c => c.task_id); // Filter out any undefined task_ids

  if (taskComments.length > 0) {
    await knex('task_comments').insert(taskComments);
  }

  console.log('Sample data seeded successfully!');
  console.log('');
  console.log('Test Users:');
  console.log('-----------------------------------');
  console.log('Admin:            sukrukemuk@gmail.com (mevcut şifreniz)');
  console.log('Project Manager:  pm@test.com / Test123!');
  console.log('Developer 1:      dev1@test.com / Test123!');
  console.log('Developer 2:      dev2@test.com / Test123!');
  console.log('Viewer:           viewer@test.com / Test123!');
  console.log('-----------------------------------');
};