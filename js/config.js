// 应用配置文件

// 创建共享的Supabase客户端实例
window.supabaseClient = null;

// 应用配置对象
const appConfig = {
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
        // 基础功能模块
    },
    
    // 第三方服务配置
    services: {
        supabase: {
            url: 'https://zrxtmrsfnycdcfolgwiq.supabase.co', // 替换为你的Supabase项目URL
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeHRtcnNmbnljZGNmb2xnd2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzg4MzUsImV4cCI6MjA4MDY1NDgzNX0.dOrxsRZR9zE-BZ1s_t-RT418sOyAdUmbeNG_1G7-NV4', // 替换为你的Supabase匿名密钥
            auth: {
                persistSession: true,
                autoRefreshToken: true
            }
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

// 设置appConfig到全局
window.appConfig = appConfig;

// 创建并配置Supabase客户端
console.log('开始初始化Supabase客户端...');
console.log('Supabase库是否可用:', typeof window.supabase !== 'undefined');
console.log('Supabase配置:', appConfig.services.supabase);

if (typeof window.supabase !== 'undefined' && appConfig.services && appConfig.services.supabase) {
    try {
        // 创建Supabase客户端实例
        window.supabaseClient = window.supabase.createClient(
            appConfig.services.supabase.url,
            appConfig.services.supabase.anonKey,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );
        console.log('✅ Supabase客户端已初始化');
        
        // 测试连接
        window.supabaseClient.from('users').select('*').limit(1)
            .then(() => console.log('✅ Supabase连接测试成功'))
            .catch(error => console.warn('⚠️ Supabase连接测试失败:', error.message));
    } catch (error) {
        console.error('❌ Supabase客户端创建失败:', error);
        window.supabaseClient = null;
    }
} else {
    console.warn('❌ Supabase配置未找到或客户端库未加载，应用将以本地模式运行');
    window.supabaseClient = null;
}