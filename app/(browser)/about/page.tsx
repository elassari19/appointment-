'use client';

import { useLocale } from '@/contexts/LocaleContext'
import { 
  CheckCircle,
  ArrowRight,
  Award,
  Heart,
  Users,
  BadgeCheck
} from "lucide-react"

export default function AboutPage() {
  const { t } = useLocale()

  const timeline = [
    {
      year: "2012",
      title: t('about.timeline2012Title'),
      description: t('about.timeline2012Desc')
    },
    {
      year: "2015",
      title: t('about.timeline2015Title'),
      description: t('about.timeline2015Desc')
    },
    {
      year: "2019",
      title: t('about.timeline2019Title'),
      description: t('about.timeline2019Desc')
    },
    {
      year: "2024",
      title: t('about.timeline2024Title'),
      description: t('about.timeline2024Desc')
    }
  ]

  const team = [
    {
      name: "Dr. James Wilson",
      role: "Chief Executive Officer",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCiyO7LaApmq5OOy27RmX36EgQ1NICGkpddQvTx9HN1OFD1hWuKttZzxcBsF_Ty0WPlHTJSY3348A1ud6j_YjmJBNny9umTDcfzLtQOt3TpJINWNfUWO3gPmDrIPOWqX3wmW7wZM4CaX1w-cKVpjw79VbDrn1GDT15qHJv1d0fgGSvXmFPzJsgkFQCrOS_i-UkmEKj9WPOkPYgBVlph7hoJ7lg3ErTwRXCAGipkfH4_NAFSPg_vi1B9osmPyuL1PoWdSUS4Fetf0iU"
    },
    {
      name: "Dr. Elena Rodriguez",
      role: "Chief Medical Officer",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdkRc54SCUb-CTkSVIoB6Dk2moTDixEej48hfoHEHRRaG5M7DBGwM6EW31MiowEDhoG2I3OdOMF1f8cxtIj3mXqIirD--nFlnfyPKMy5qu1snKty011BAst5TbcBgxN9u_Sw_s-UsAoUNsYuUGEXI1MqhNZqVCxEYJbXIu4Zqrw5I7HW55ocnvanKDZ-xF_5ri2cUZSEtaPJobI_HsAyqKXwF7zHihu7xshohavQysotJZNqYgPq5P68yKo7ZL786liCg3ygi-6PLv"
    },
    {
      name: "Marcus Chen",
      role: "Head of Technology",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI0YSGKjKlF5k7NfJIbDIbo7sos1U-YY7QtdcoPxUP3OReb7fKQ6qIK3ExAmqen21WCiPeHq6qWvMINGSNXJLMo8qSNNJiJVlvp9DiyAOx5YFZwQ3YlnHZUd_8Ef6mptEIszfi0gr6NN8ISBPZXqg9psWnTy5a8hAVwYO5Sayb0ypMpjnoXmudm1NrcyrXO5gEbRwkqDzr_-J14EzdRwYjXDbqYczwrbzBc_XnIwnaLvM9MayonJj8wIJ6uZGtnzsT9QYC4Ex84RiF"
    },
    {
      name: "Sarah Jenkins",
      role: "Head of Patient Experience",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-dX9yz7S361-mRmYuDO6vzW4OCnHkRAsOGQW38MdajOKUMpLezeqTPfwR91UZZ83Ydh3g8IpD-9H1tdeJeGc0Aj2-i8ikosZKq947mu70Kp1caQlMk8j3rFY6ZKYnLWUH8Ye6Cc_dEj3syy3Wp7WX019JcsbbF_JozExOvdoKsU4BsbvDr7McNLAV_-7FOXNMKzqgGAPNd2IqqgsaitsQ0AS0at2yNqbJRvThxll96kFhKAuJsIbjn8pCyGshMKmuilSn-8m8-r2s"
    }
  ]

  const features = [
    {
      title: t('about.qualityTitle'),
      description: t('about.qualityDesc'),
      icon: Award
    },
    {
      title: t('about.techTitle'),
      description: t('about.techDesc'),
      icon: Heart
    },
    {
      title: t('about.patientTitle'),
      description: t('about.patientDesc'),
      icon: Users
    }
  ]

  return (
    <main className="w-full pt-24">
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'linear-gradient(rgba(27, 25, 13, 0.7), rgba(27, 25, 13, 0.4)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCCyZD68qWy1VnQIErbcswxaSDmmiehvajt_1g2oUTSxgLFU74PL5cQaE_zqfJEvVLcICZ-SdwZ1476_CwTaN1Y9lqHoDGgamKi185tj-sG_Gy1MeRIV3Rff0RF5SxWZOh_iF_x6d8gGsCdSlGXHJ8ahrkC272FiN_9oyWeODvbEpCwc1SRMr2lTzCArjeiyNAUQ4nlAj1BwC308B175dk2heitJH1Xec1BL1x9yyeS8kOShDR75D6PgIGfrveKPpcpA-PUc8jpCmob")' }}
        />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="text-[#edca13] font-bold tracking-widest uppercase text-xs mb-4 block">{t('about.established')}</span>
          <h1 className="text-white text-4xl md:text-6xl font-black leading-tight mb-6">
            {t('about.heroTitle')}
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            {t('about.heroSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-40 bg-white">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#edca13]/10 px-3 py-1 rounded-full text-[#edca13] font-bold text-xs uppercase">
              <BadgeCheck className="text-sm" /> {t('about.ourMission')}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1b190d] leading-tight">{t('about.missionTitle')}</h2>
            <p className="text-[#1b190d]/70 text-lg leading-relaxed">
              {t('about.missionDesc')}
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-[#edca13] mt-1" size={20} />
                <span className="font-semibold">{t('about.accessibility')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-[#edca13] mt-1" size={20} />
                <span className="font-semibold">{t('about.integrity')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-[#edca13] mt-1" size={20} />
                <span className="font-semibold">{t('about.innovation')}</span>
              </li>
            </ul>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-[#edca13]/20 rounded-xl blur-xl group-hover:bg-[#edca13]/30 transition-all"></div>
            <img 
              alt="Doctor holding a patient's hand with care" 
              className="relative rounded-xl w-full h-[400px] object-cover shadow-2xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkkxdG7ng6AGbZYTZH44tKo_NmiKhfytqWv5D7y3LOHWuxgip4HxPpHJ9DS-AcmlpBfGRlERRd4GiOIIhgzpj8GO5e1eM2f0kEn9szheA_UJF2mggTAoLn8XbR0rljN40QhL-RpRlPaFg_WwsUM_0BWPfUxQhyAG9dJVjycCrssqpg9AnlfEggVtbhev2o9vGZ2HJ_MLXLXxmlot0hgQUMLMDb5IHtwPSSK8Z7w0UtwX_8VFxun93u4KUxH3uHfm23j6Yaeh6SLTIw"
            />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-40 bg-[#f8f8f6]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{t('about.timelineTitle')}</h2>
            <p className="text-[#1b190d]/60 max-w-xl mx-auto text-lg font-medium">{t('about.timelineSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {timeline.map((item) => (
              <div key={item.year} className="p-8 bg-white rounded-xl shadow-sm border-t-4 border-[#edca13] hover:translate-y-[-5px] transition-transform">
                <span className="text-3xl font-black text-[#edca13]/30 mb-4 block">{item.year}</span>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-[#1b190d]/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-40 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{t('about.teamTitle')}</h2>
              <p className="text-[#1b190d]/60 text-lg">{t('about.teamSubtitle')}</p>
            </div>
            <button className="flex items-center gap-2 text-[#1b190d] font-bold border-b-2 border-[#edca13] pb-1 group">
              {t('about.viewAllMembers')}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="group">
                <div className="relative overflow-hidden rounded-xl aspect-[4/5] mb-4">
                  <img 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={member.image}
                  />
                </div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-[#edca13] font-bold text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-40 bg-[#f8f8f6]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{t('about.whyChooseTitle')}</h2>
            <p className="text-[#1b190d]/60 max-w-xl mx-auto text-lg font-medium">{t('about.whyChooseSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white p-10 rounded-2xl shadow-sm border border-[#f3f1e7] flex flex-col items-center text-center">
                <div className="size-16 rounded-2xl bg-[#edca13]/20 text-[#edca13] flex items-center justify-center mb-6">
                  <feature.icon className="text-4xl" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-[#1b190d]/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
