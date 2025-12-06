// 数据分析系统
    class DataAnalyticsSystem {
            constructor(financialManager = null, crmSystem = null) {
                this.dashboards = new Map();
                this.reports = new Map();
                this.datasets = new Map();
                this.financialManager = financialManager;
                this.crmSystem = crmSystem;
                this.initializeSampleData();
            }

            initializeSampleData() {
                // 模拟数据集
                const sampleDatasets = [
                    {
                        id: 'dataset_001',
                        name: '用户行为数据',
                        description: '用户访问和交互数据',
                        fields: ['userId', 'action', 'timestamp', 'duration'],
                        lastUpdated: new Date('2024-01-29')
                    },
                    {
                        id: 'dataset_002',
                        name: '交易数据',
                        description: '客户交易记录',
                        fields: ['transactionId', 'customerId', 'amount', 'date'],
                        lastUpdated: new Date('2024-01-29')
                    }
                ];

                sampleDatasets.forEach(dataset => this.datasets.set(dataset.id, dataset));
            }

            // 分析用户行为
            analyzeUserBehavior(startDate, endDate) {
                // 模拟用户行为分析
                const metrics = {
                    totalUsers: 12500,
                    activeUsers: 8500,
                    newUsers: 1500,
                    returningUsers: 7000,
                    avgSessionDuration: 8.5,
                    bounceRate: 32.5,
                    engagementGrowth: 8.7,
                    revenueGrowth: 22.1
                };

                const trends = {
                    userGrowth: 12.5,
                    engagementGrowth: 8.7,
                    revenueGrowth: 22.1
                };

                return {
                    period: { startDate, endDate },
                    metrics,
                    trends,
                    insights: this.generateBehavioralInsights(metrics, trends)
                };
            }

            // 分析销售业绩
            analyzeSalesPerformance(period = 'month') {
                // 模拟销售分析
                const financialReport = this.financialManager ? this.financialManager.generateFinancialReport(period) : { overview: { income: 0, expenses: 0, netIncome: 0 } };
                const customerStats = this.crmSystem ? this.crmSystem.getCustomerStats() : { totalCustomers: 0, customerRetentionRate: 0 };
                const marketingROI = { // 模拟营销ROI数据
                    totalSpent: 25000,
                    totalRevenue: 75000,
                    roi: 200
                };

                return {
                    period,
                    financial: financialReport.overview,
                    customer: customerStats,
                    marketing: marketingROI,
                    kpis: this.calculateSalesKPIs(financialReport, customerStats)
                };
            }

            // 计算销售KPI
            calculateSalesKPIs(financialReport, customerStats) {
                const income = financialReport.overview.income;
                const expenses = financialReport.overview.expenses;
                const netIncome = financialReport.overview.netIncome;
                
                return {
                    customerAcquisitionCost: expenses > 0 ? expenses / customerStats.totalCustomers : 0,
                    customerLifetimeValue: customerStats.totalCustomers > 0 ? 
                        income / customerStats.totalCustomers : 0,
                    monthlyRecurringRevenue: income,
                    churnRate: 100 - customerStats.customerRetentionRate,
                    netPromoterScore: this.calculateNPS()
                };
            }

            // 计算NPS
            calculateNPS() {
                // 模拟NPS计算
                return 42; // 假设的NPS分数
            }

            // 生成行为洞察
            generateBehavioralInsights(metrics, trends) {
                const insights = [];

                if (trends.userGrowth > 10) {
                    insights.push({
                        type: 'positive',
                        title: '用户快速增长',
                        description: '用户增长率达到' + trends.userGrowth + '%',
                        impact: 'medium'
                    });
                }

                if (metrics.bounceRate > 30) {
                    insights.push({
                        type: 'warning',
                        title: '跳出率较高',
                        description: '当前跳出率为' + metrics.bounceRate + '%',
                        impact: 'high'
                    });
                }

                return insights;
            }

            // 收入预测
            forecastRevenue(months = 12) {
                const forecast = [];
                const currentRevenue = this.financialManager ? this.financialManager.getFinancialOverview().netIncome : 0;
                
                for (let i = 0; i < months; i++) {
                    const growthRate = 0.08 + (Math.random() * 0.04); // 8-12%增长率
                    const predictedRevenue = currentRevenue * Math.pow(1 + growthRate, i + 1);
                    
                    forecast.push({
                        month: i + 1,
                        predictedRevenue: this.formatCurrency(predictedRevenue),
                        confidence: 85 - (i * 2) // 置信度随时间递减
                    });
                }

                return forecast;
            }

            // 创建仪表板
            createDashboard(dashboardData) {
                const dashboardId = 'dashboard_' + Date.now();
                const dashboard = {
                    id: dashboardId,
                    ...dashboardData,
                    widgets: [],
                    filters: {},
                    createdAt: new Date()
                };
                this.dashboards.set(dashboardId, dashboard);
                return dashboard;
            }

            // 生成报告
            generateReport(reportType, parameters) {
                let reportData;
                switch(reportType) {
                    case 'financial':
                        reportData = financialManager.generateFinancialReport(parameters.period);
                        break;
                    case 'sales':
                        reportData = this.analyzeSalesPerformance(parameters.period);
                        break;
                    case 'user_behavior':
                        reportData = this.analyzeUserBehavior(parameters.startDate, parameters.endDate);
                        break;
                    default:
                        reportData = { error: '不支持的报表类型' };
                }

                const reportId = 'report_' + Date.now();
                const report = {
                    id: reportId,
                    type: reportType,
                    data: reportData,
                    generatedAt: new Date()
                };
                this.reports.set(reportId, report);
                return report;
            }

            // 导出报告
            exportReport(reportId, format = 'json') {
                const report = this.reports.get(reportId);
                if (!report) return null;

                switch(format) {
                    case 'json':
                        return JSON.stringify(report, null, 2);
                    case 'csv':
                        return this.convertToCSV(report.data);
                    case 'pdf':
                        return this.generatePDF(report);
                    default:
                        return null;
                }
            }

            // 转换为CSV格式
            convertToCSV(data) {
                if (!data.metrics) return '';
                
                const headers = Object.keys(data.metrics).join(',');
                const values = Object.values(data.metrics).join(',');
                return `${headers}\n${values}`;
            }

            // 生成PDF报告
            generatePDF(report) {
                // 模拟PDF生成
                return `PDF报告: ${report.type} - 生成时间: ${report.generatedAt}`;
            }

            // 格式化货币
            formatCurrency(amount) {
                return '¥' + amount.toLocaleString();
            }
        }

        // 实例化数据分析系统
        // 将类添加到全局变量
        window.DataAnalyticsSystem = DataAnalyticsSystem;