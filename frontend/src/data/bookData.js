const chapters = [
  {
    id: 1,
    title: "Глава 1: Зарождение идеи",
    subtitle: "О проекте",
    description: `<p>Это портфолио — не просто список технологий, а живой рассказ о том, как создавался <strong>AI Automation Portfolio</strong>.</p>
      <p>Проект зародился как идея автоматизировать рутинные задачи для ресторанного бизнеса. Здесь технологии служат искусству управления.</p>
      <p>Я объединил <strong>Django</strong> для надёжного бэкенда и <strong>React</strong> для интерактивного интерфейса.</p>`,
    gif: "/demos/demo-idea.gif",
    technologies: ["Django", "React", "Docker"],
  },
  {
    id: 2,
    title: "Глава 2: AI - Дух магии",
    subtitle: "Искусственный интеллект",
    description: `<p>В сердце проекта — <strong>AI</strong>, который даёт жизнь чат-боту и помогает искать поставщиков.</p>
      <p>Я интегрировал <strong>GigaChat</strong> (Сбер), чтобы бот понимал естественный язык и давал осмысленные ответы.</p>
      <p>Благодаря AI, операторы могут не отвечать на типовые вопросы, а сосредоточиться на сложных задачах.</p>`,
    gif: "/demos/demo-ai.gif",
    technologies: ["GigaChat", "NLP", "Python"],
  },
  {
    id: 3,
    title: "Глава 3: Поиск поставщиков",
    subtitle: "2GIS и автоматизация",
    description: `<p>Одна из ключевых функций — автоматический поиск поставщиков через <strong>2GIS API</strong>.</p>
      <p>Система не просто находит компании, но и с помощью AI отсеивает нерелевантных, экономя часы ручной работы.</p>
      <p>Результат — база проверенных поставщиков, которая всегда под рукой у оператора.</p>`,
    gif: "/demos/demo-suppliers.gif",
    technologies: ["2GIS API", "AI Filtering", "Celery"],
  },
  {
    id: 4,
    title: "Глава 4: Сила анализа",
    subtitle: "Дашборды и статистика",
    description: `<p>Данные бесполезны без интерпретации. <strong>Дашборд</strong> превращает сырые цифры в понятные графики.</p>
      <p>Вы можете видеть динамику продаж, популярность категорий и общую выручку в реальном времени.</p>
      <p>Это помогает принимать быстрые и обоснованные бизнес-решения.</p>`,
    gif: "/demos/demo-dashboard.gif",
    technologies: ["Recharts", "Django REST", "PostgreSQL"],
  },
  {
    id: 5,
    title: "Глава 5: Тьма и свет",
    subtitle: "Тёмная тема",
    description: `<p>Детали имеют значение. <strong>Тёмная тема</strong> — это не просто модный тренд, а забота о глазах пользователя.</p>
      <p>Она плавно переключается и сохраняет выбор, создавая комфортную среду для работы в любое время суток.</p>
      <p>Этот проект — о том, как технологии должны служить человеку.</p>`,
    gif: "/demos/demo-darktheme.gif",
    technologies: ["Tailwind CSS", "React Context", "LocalStorage"],
  },
];

export const bookPages = chapters.flatMap((chapter, index) => [
  {
    id: `l-${chapter.id}`,
    type: 'text',
    chapterIndex: index,
    title: chapter.title,
    subtitle: chapter.subtitle,
    description: chapter.description,
    technologies: chapter.technologies,
  },
  {
    id: `r-${chapter.id}`,
    type: 'gif',
    chapterIndex: index,
    gif: chapter.gif,
    title: chapter.title,
  },
]);