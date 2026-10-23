import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  tr: { translation: {
    sidebar: { search: 'Ara', projects: 'Projeler', newProject: 'Yeni proje', settings: 'Ayarlar', theme: 'Tema', language: 'Dil', light: 'Açık', dark: 'Koyu' },
    home: { search: 'Projelerde ara…', newProject: 'Yeni proje', quick: 'Hızlı oluştur', savedScenarios: 'Kayıtlı senaryolarınız', scenario: 'senaryo', recent: 'Son açılanlar', recentDescription: 'En son çalıştığınız projeler', project: 'proje', firstProject: 'İlk projenizi oluşturun', firstProjectDescription: 'Şablonlar ve kurallarla temiz bir başlangıç yapın.', open: 'Aç' },
    create: { create: 'Proje oluştur', creating: 'Oluşturuluyor…', next: 'Devam', info: 'Proje bilgileri', documents: 'Belgeler', options: 'Seçenekler', projectName: 'Proje adı', projectType: 'Proje türü', target: 'Hedef klasör', markdown: 'Markdown belgesi', optional: 'İsteğe bağlı', chooseFile: 'Dosya seç', newMarkdown: 'Yeni Markdown', category: 'Kategori', chooseCategory: 'Kategori seçin', back: 'Geri', cancel: 'Vazgeç', step: 'Adım' },
    settings: { general: 'Genel', scenarios: 'Hızlı oluşturma', categories: 'Kategoriler', templates: 'Şablonlar', projects: 'Projeler', github: 'GitHub', save: 'Değişiklikleri kaydet', saving: 'Kaydediliyor…', askCategory: 'Oluştururken sor', newScenario: 'Yeni senaryo' },
    update: { available: 'Güncelleme var', download: 'İndir', downloading: 'İndiriliyor', install: 'Kur ve yeniden başlat', checking: 'Kontrol ediliyor', current: 'Uygulama güncel', error: 'Güncelleme hatası' }
  } },
  en: { translation: {
    sidebar: { search: 'Search', projects: 'Projects', newProject: 'New project', settings: 'Settings', theme: 'Theme', language: 'Language', light: 'Light', dark: 'Dark' },
    home: { search: 'Search projects…', newProject: 'New project', quick: 'Quick create', savedScenarios: 'Saved scenarios', scenario: 'scenario', recent: 'Recently opened', recentDescription: 'Projects you recently worked on', project: 'project', firstProject: 'Create your first project', firstProjectDescription: 'Start clean with templates and rules.', open: 'Open' },
    create: { create: 'Create project', creating: 'Creating…', next: 'Continue', info: 'Project details', documents: 'Documents', options: 'Options', projectName: 'Project name', projectType: 'Project type', target: 'Target folder', markdown: 'Markdown document', optional: 'Optional', chooseFile: 'Choose file', newMarkdown: 'New Markdown', category: 'Category', chooseCategory: 'Choose a category', back: 'Back', cancel: 'Cancel', step: 'Step' },
    settings: { general: 'General', scenarios: 'Quick create', categories: 'Categories', templates: 'Templates', projects: 'Projects', github: 'GitHub', save: 'Save changes', saving: 'Saving…', askCategory: 'Ask when creating', newScenario: 'New scenario' },
    update: { available: 'Update available', download: 'Download', downloading: 'Downloading', install: 'Install and restart', checking: 'Checking', current: 'App is up to date', error: 'Update error' }
  } }
} as const

void i18n.use(initReactI18next).init({ resources, lng: 'tr', fallbackLng: 'tr', interpolation: { escapeValue: false } })

export default i18n
