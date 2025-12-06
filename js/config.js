// 应用配置文件

window.appConfig = {
    // 应用基本信息
    appInfo: {
        name: '智能导航中心',
        version: '2.0.0',
        description: '多功能集成平台',
        author: '智能导航中心'
    },
    
    // API配置
    api: {
        baseUrl: '', // 预留API基础URL
        timeout: 10000,
        retryCount: 3
    },
    
    // 主题配置
    theme: {
        default: 'light',
        available: ['light', 'dark']
    },
    
    // 性能监控配置
    performance: {
        enable: true,
        samplingRate: 1.0,
        logLevel: 'info'
    },
    
    // 数据存储配置
    storage: {
        prefix: 'nav_center_',
        expiration: 365 * 24 * 60 * 60 * 1000 // 1年
    },
    
    // 功能模块配置
    modules: {
        projectManagement: true,
        crm: true,
        financial: true,
        collaboration: true,
        analytics: true,
        apiIntegration: true
    },
    
    // 第三方服务配置
    services: {
        supabase: {
            url: '', // 预留Supabase URL
            anonKey: '' // 预留Supabase匿名密钥
        },
        chartjs: {
            version: '4.4.0'
        },
        marked: {
            version: 'latest'
        }
    },
    
    // 响应式配置
    responsive: {
        breakpoints: {
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            '2xl': 1536
        }
    },
    
    // 本地化配置
    i18n: {
        defaultLocale: 'zh-CN',
        availableLocales: ['zh-CN', 'en-US']
    },
    
    // 安全配置
    security: {
        xssProtection: true,
        csrfProtection: true,
        contentSecurityPolicy: {
            defaultSrc: "'self'",
            scriptSrc: "'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net unpkg.com",
            styleSrc: "'self' 'unsafe-inline' cdn.jsdelivr.net unpkg.com",
            imgSrc: "'self' data: https:"
        }
    }
};
