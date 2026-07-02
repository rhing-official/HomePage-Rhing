import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://rhing.jp'
    const currentDate = new Date().toISOString().split('T')[0] // 自動で当日の日付をセットします

    // ルーティング設計に基づいたパスの設定
    const routes = [
        { path: '', priority: 1.0, changefreq: 'daily' },
        { path: '/about', priority: 0.8, changefreq: 'monthly' },
        { path: '/services', priority: 0.8, changefreq: 'monthly' },
        { path: '/services/daidai', priority: 0.7, changefreq: 'monthly' }, // 必要に応じて追加・削除してください
        { path: '/services/komichi', priority: 0.7, changefreq: 'monthly' },
        { path: '/contact', priority: 0.8, changefreq: 'monthly' },
        { path: '/legal/charter', priority: 0.5, changefreq: 'monthly' },
        { path: '/legal/privacy', priority: 0.5, changefreq: 'monthly' },
        { path: '/legal/terms', priority: 0.5, changefreq: 'monthly' },
        { path: '/legal/disclaimer', priority: 0.5, changefreq: 'monthly' },
        { path: '/legal/creator', priority: 0.5, changefreq: 'monthly' },
    ]

    return routes.map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: currentDate,
        changeFrequency: route.changefreq as any,
        priority: route.priority,
    }))
}