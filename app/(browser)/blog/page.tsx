'use client';

import { useLocale } from '@/contexts/LocaleContext'
import { 
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  Heart,
  Sparkles,
  User,
  FlaskConical
} from "lucide-react"

export default function BlogPage() {
  const { t } = useLocale()

  const featuredArticle = {
    category: t('blogPage.medicalAdvancements'),
    date: 'Oct 24, 2023',
    title: t('blogPage.heroTitle'),
    description: t('blogPage.heroDesc'),
    readTime: '8',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9OoyAeYvMwPLy82xqr0DKRrvmfpl-5OInZ42KWfpbppGymexT01NQdvHZTrUE-jwVuZVAIkRIuFyCcwGGJk8t3oEz6Ng0FkGS9yfQLzuYJ-FSr-lo8BGl1G9gGGMDygvnCIqGNNJOlMXfJb88u7YA_wVzefhrx-YLXdy5a3ck4sITQ-k5RE5xrB-YvykJVlhigPd_wqdV5B_3O8gem4ArU2OPtHAfX16sFVCefzUQM7-YAhLU0WXShOhTumYwopNPOFNzhL_bQAsm'
  }

  const categories = [
    { key: 'all', label: t('blogPage.allArticles') },
    { key: 'wellness', label: t('blogPage.wellness') },
    { key: 'advancements', label: t('blogPage.medicalAdvancements') },
    { key: 'stories', label: t('blogPage.patientStories') },
    { key: 'research', label: t('blogPage.researchUpdates') }
  ]

  const articles = [
    {
      category: t('blogPage.wellness'),
      date: 'Oct 22, 2023',
      title: t('blogPage.article1Title'),
      description: t('blogPage.article1Desc'),
      readTime: '5',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVYdyCmWZh9PawecgJ889sbC2getf-ubryWCv6d-LQ3KkFbqWlo0fuSe7p9bKIfhWwWkfnybH_7YSi78HHaeQbvuFwRAF0Mf_ZFOF3eYAMOvYjrN9OKtxLCM63WBkp2T6Yxy4-KZsklj0kuVFmbDtQsFVW5dvGMLWDQjyb8VSJ6GdKRq2GVxcd7C00oebm6t6LQ4cJESHF6UrNp_Wz3_AChwqST43oxSOedV8KlNqYftCdwSlbyZSKy2NUMihwJFCyg6vbCsKj5twA',
      icon: Heart
    },
    {
      category: t('blogPage.medicalAdvancements'),
      date: 'Oct 20, 2023',
      title: t('blogPage.article2Title'),
      description: t('blogPage.article2Desc'),
      readTime: '12',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8hqV5rJxmco-SuqC6J2o8nrrLlpndVs21yOvU16WI3sA_9lhv8nQvtgN3xTdXhZXAmTw5mlKqGnSuAGdK9MXaCM0uNE4sdSG4QpwDu43_DI-moPlnV6wDH6vcf_Wyz38bc4J5kScVU-QS3DVvHo-ZItRvtLlIhlsiKQgEWzL6pWDk_e0zfJRbY3FmURSg0xhSLsCESRzrDyBJG-N2rDEjIO3gYIQPjlTrLrn7NS9xz9yKRoI-9kU1lYvKv553RD-3Dbez0oj4VTef',
      icon: Sparkles
    },
    {
      category: t('blogPage.patientStories'),
      date: 'Oct 18, 2023',
      title: t('blogPage.article3Title'),
      description: t('blogPage.article3Desc'),
      readTime: '6',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl24qmjK9PAx7Ux75yEbz4SwxZUtv6NcuyenE-PQCJO0YGKAsCXdJ0jIMG4xkTjHxlWo9iwxPZ_GW49jwPcVuW1hzjJiYXhHOQWp1dPJMSXdam3T3VTRsIEk_NbpZkQ0AG1AvKQO81kbl4iqB9lmoq84EWzgHxCMqKoVGXwwKgO29lQvRs7KpR5h8_5WSQNCmo8xRDV-gYoqIYeSFfIadvC3uXAT2YvTkht15G9SvUC6Kx8fYSGN8kM9pRcBEFIQ0ILzysKoguSCOf',
      icon: User
    },
    {
      category: t('blogPage.wellness'),
      date: 'Oct 15, 2023',
      title: t('blogPage.article4Title'),
      description: t('blogPage.article4Desc'),
      readTime: '4',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaYn_klkaTxokhmNQ7XcsDLbYscifcuLX2IF8HckA89J7WwYiQitDdMcxLKGLMEiidz-58sGbOyKVYk62tUsbFdVmSCiy2Sd4ZhbJPjtUnceFnV5ags2KwD2MSveHgMdWHHO_85mC_7ikB7aTR62-FepNQVqnFu_kbGvGsVQ-KCM7V41xCNNz7WwQEXuKCKk4zRmdheJujkGplk13aDyM1Wm4yYR0sLVNW1C4Yjsj04CxafpiBLELWNzd5UXdQh0tqg8qI51kf8L_9',
      icon: Heart
    },
    {
      category: t('blogPage.medicalAdvancements'),
      date: 'Oct 12, 2023',
      title: t('blogPage.article5Title'),
      description: t('blogPage.article5Desc'),
      readTime: '10',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGhfFXh74bvjdIFe31ZmtjxH3HKn-gkOjlyb0b-8HfOwzEdh7PrecGUJzcrL9Kk0equJyF6mIiKv-cNR-_n0s3lDDYoUMT0SMocAbXqPkaZfupkeNO3D3CIBFw_OUix2R8rwNW5_uQd-m9HM9oXseWxmG5ow7zlIIqiPCASe67ibtBeWQQ5VvZWONGTcGh45TeP1AEajgDXz8fvUzy4QqPFTdHnBtrLM15AHGTHRrnZwUjp4vMJVyHkjSnLjLxSbMgyGLXyTGiMsex',
      icon: FlaskConical
    },
    {
      category: t('blogPage.patientStories'),
      date: 'Oct 10, 2023',
      title: t('blogPage.article6Title'),
      description: t('blogPage.article6Desc'),
      readTime: '7',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtuYT1pkvyVBaLolpW7uKpI9mW6CYzvrNI6cVgTdNbUbE5rnx59DE7_GRF1ksh7OgqZSilOjZsEYJNIZzfSRGjO1Sy5Exx0A_wzlhKo4TJOYs0ZLEe-0tuny4Xq5jZAwld9hJDQzIItYGO5zL4kILXBpRt9wLf2AOUFyh25AhEWwVOsNEiVmqw62M_AaSraviSjLtNtdIjoWtMlRALFPUeBb2DKFDMcxQHGZaQXIroZ6DLuGcFaSDK1NYq4Vs8acatg3wo8FgSkN45',
      icon: User
    }
  ]

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8 pt-24">
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <span className="bg-[#edca13]/20 text-[#edca13] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            {t('blogPage.editorsChoice')}
          </span>
          <div className="h-px flex-1 bg-[#e7e3cf]"></div>
        </div>
        <div className="grid lg:grid-cols-12 gap-8 items-center bg-white rounded-xl overflow-hidden shadow-sm border border-[#e7e3cf]">
          <div className="lg:col-span-7 h-[300px] lg:h-[500px]">
            <img 
              className="w-full h-full object-cover"
              alt="Doctor interacting with medical hologram"
              src={featuredArticle.image}
            />
          </div>
          <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col gap-4">
            <div className="flex gap-4 text-[#9a8d4c] text-sm font-medium">
              <span>{featuredArticle.category}</span>
              <span>•</span>
              <span>{featuredArticle.date}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight">
              {featuredArticle.title}
            </h2>
            <p className="text-[#1b190d]/70 text-lg leading-relaxed">
              {featuredArticle.description}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <button className="bg-[#edca13] text-[#1b190d] px-8 py-3 rounded-lg font-bold hover:scale-[1.02] transition-transform flex items-center gap-2">
                {t('blogPage.readFullArticle')}
                <ArrowRight size={18} />
              </button>
              <span className="text-sm font-semibold text-[#9a8d4c]">{featuredArticle.readTime} {t('blogPage.minRead')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-8 overflow-x-auto">
        <div className="flex border-b border-[#e7e3cf] gap-8 min-w-max">
          {categories.map((cat, idx) => (
            <button 
              key={cat.key}
              className={`pb-4 px-2 font-bold text-sm tracking-wide transition-colors ${
                idx === 0 
                  ? 'border-b-4 border-[#edca13] text-[#1b190d]' 
                  : 'border-b-4 border-transparent text-[#9a8d4c] hover:text-[#1b190d]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold tracking-tight">{t('blogPage.recentArticles')}</h3>
          <div className="flex gap-2">
            <button className="size-10 rounded-full border border-[#e7e3cf] flex items-center justify-center hover:bg-[#f3f1e7] transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button className="size-10 rounded-full border border-[#e7e3cf] flex items-center justify-center hover:bg-[#f3f1e7] transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article key={article.title} className="group cursor-pointer">
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-sm">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={article.title}
                  src={article.image}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#edca13] text-[#1b190d] px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[#9a8d4c] text-xs font-semibold">{article.date} • {article.readTime} {t('blogPage.minRead')}</span>
                <h4 className="text-xl font-bold leading-tight group-hover:text-[#edca13] transition-colors">{article.title}</h4>
                <p className="text-[#1b190d]/60 text-sm line-clamp-2">{article.description}</p>
                <a className="mt-2 text-[#edca13] font-bold text-sm flex items-center gap-1 group/link" href="#">
                  {t('blogPage.readMore')}
                  <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button className="px-10 py-3 border-2 border-[#edca13] text-[#1b190d] font-bold rounded-lg hover:bg-[#edca13] transition-colors">
            {t('blogPage.loadMore')}
          </button>
        </div>
      </section>

      <section className="mt-16 bg-[#edca13]/10 rounded-2xl p-8 lg:p-12 text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 size-40 bg-[#edca13]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 size-40 bg-[#edca13]/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
          <Mail className="text-[#edca13] text-5xl" size={48} />
          <h3 className="text-3xl font-extrabold tracking-tight">{t('blogPage.stayInformed')}</h3>
          <p className="text-[#1b190d]/70 text-lg">{t('blogPage.newsletterDesc')}</p>
          <form className="w-full flex flex-col sm:flex-row gap-3">
            <input 
              className="flex-1 px-6 py-4 bg-white border-none rounded-xl focus:ring-2 focus:ring-[#edca13] shadow-sm"
              placeholder={t('blogPage.emailPlaceholder')}
              type="email"
            />
            <button 
              className="bg-[#edca13] text-[#1b190d] px-8 py-4 rounded-xl font-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              type="submit"
            >
              {t('blogPage.joinNow')}
            </button>
          </form>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#9a8d4c]">{t('blogPage.noSpam')}</p>
        </div>
      </section>
    </main>
  )
}
