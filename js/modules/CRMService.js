// CRM系统
    class CRMService {
            constructor() {
                this.customers = new Map();
                this.contacts = new Map();
                this.opportunities = new Map();
                this.leads = new Map();
                this.activities = new Map();
                this.initializeSampleData();
            }

            initializeSampleData() {
                // 模拟客户数据
                const sampleCustomers = [
                    {
                        id: 'cust_001',
                        name: '字节跳动',
                        type: 'enterprise',
                        industry: '科技',
                        size: 100000,
                        tier: 'premium',
                        contactPerson: '张经理',
                        email: 'zhang@bytedance.com',
                        phone: '13800138000',
                        address: '北京市海淀区',
                        contractValue: 500000,
                        subscriptionDate: new Date('2023-05-20'),
                        renewalDate: new Date('2024-05-20'),
                        notes: '重要客户，需要重点关注'
                    },
                    {
                        id: 'cust_002',
                        name: '腾讯科技',
                        type: 'enterprise',
                        industry: '媒体',
                        size: 50000,
                        tier: 'standard',
                        contactPerson: '王主管',
                        email: 'wang@tencent.com',
                        phone: '13700137000',
                        address: '北京市海淀区',
                        contractValue: 300000,
                        subscriptionDate: new Date('2023-06-10'),
                        renewalDate: new Date('2024-06-10'),
                        notes: '新签约客户，潜力巨大'
                    }
                ];

                sampleCustomers.forEach(customer => this.customers.set(customer.id, customer));

                // 模拟销售机会数据
                const sampleOpportunities = [
                    {
                        id: 'opp_001',
                        customerId: 'cust_002',
                        name: '云服务升级',
                        stage: 'negotiation',
                        value: 500000,
                        probability: 50,
                        expectedCloseDate: new Date('2024-05-15'),
                        assignedTo: 'sales_002'
                    }
                ];

                sampleOpportunities.forEach(opp => this.opportunities.set(opp.id, opp));
            }

            // 创建新客户
            createCustomer(customerData) {
                const customerId = 'cust_' + Date.now();
                const customer = {
                    id: customerId,
                    ...customerData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                this.customers.set(customerId, customer);
                return customer;
            }

            // 获取客户统计
            getCustomerStats() {
                const customers = Array.from(this.customers.values());
                const opportunities = Array.from(this.opportunities.values());
                
                const totalCustomers = customers.length;
                const activeCustomers = customers.filter(c => 
                    new Date(c.renewalDate) > new Date()).length;
                const totalContractValue = customers.reduce((sum, c) => sum + c.contractValue, 0);
                const totalOpportunityValue = opportunities.reduce((sum, o) => sum + o.value, 0);
                const weightedPipeline = opportunities.reduce((sum, o) => 
                    sum + (o.value * o.probability / 100), 0);
                
                return {
                    totalCustomers,
                    activeCustomers,
                    customerRetentionRate: Math.round((activeCustomers / totalCustomers) * 100),
                    totalContractValue: this.formatCurrency(totalContractValue),
                    totalOpportunityValue: this.formatCurrency(totalOpportunityValue),
                    weightedPipeline: this.formatCurrency(weightedPipeline),
                    averageContractValue: this.formatCurrency(totalContractValue / totalCustomers)
                };
            }

            // 格式化货币
            formatCurrency(amount) {
                return '¥' + amount.toLocaleString();
            }

            // 获取销售管道分析
            getSalesPipeline() {
                const opportunities = Array.from(this.opportunities.values());
                const stages = {
                    qualification: opportunities.filter(o => o.stage === 'qualification'),
                    proposal: opportunities.filter(o => o.stage === 'proposal'),
                    negotiation: opportunities.filter(o => o.stage === 'negotiation'),
                    closed_won: opportunities.filter(o => o.stage === 'closed_won'),
                    closed_lost: opportunities.filter(o => o.stage === 'closed_lost')
                };

                return {
                    stages,
                    totalValue: opportunities.reduce((sum, o) => sum + o.value, 0),
                    weightedValue: opportunities.reduce((sum, o) => 
                        sum + (o.value * o.probability / 100), 0),
                    winRate: opportunities.length > 0 ? 
                        (stages.closed_won.length / opportunities.length) * 100 : 0
                };
            }

            // 客户价值分析
            analyzeCustomerValue(customerId) {
                const customer = this.customers.get(customerId);
                if (!customer) return null;

                const opportunities = Array.from(this.opportunities.values())
                    .filter(o => o.customerId === customerId);
                
                const totalValue = opportunities.reduce((sum, o) => sum + o.value, 0);
                const ltv = customer.contractValue + (totalValue * 0.3); // 简单的LTV计算
                
                return {
                    lifetimeValue: ltv,
                    profitability: ltv > customer.contractValue ? 'high' : 'medium'
                };
            }

            // 收入预测
            forecastRevenue(period = 'quarter') {
                const customers = Array.from(this.customers.values());
                const opportunities = Array.from(this.opportunities.values());
                
                const currentRevenue = customers.reduce((sum, c) => sum + c.contractValue, 0);
                const pipelineRevenue = opportunities.reduce((sum, o) => 
                    sum + (o.value * o.probability / 100), 0);
                
                const growthRate = 0.15; // 假设增长率
                const forecast = {
                    currentQuarter: currentRevenue,
                    nextQuarter: currentRevenue * (1 + growthRate) + pipelineRevenue * 0.3,
                    nextYear: currentRevenue * Math.pow(1 + growthRate, 4) + pipelineRevenue * 0.7
                };

                return forecast;
            }

            // 客户搜索
            searchCustomers(query) {
                return Array.from(this.customers.values())
                    .filter(customer => 
                        customer.name.toLowerCase().includes(query.toLowerCase()) ||
                        customer.contactPerson.toLowerCase().includes(query.toLowerCase()) ||
                        customer.email.toLowerCase().includes(query.toLowerCase())
                    );
            }
        }

        // 实例化CRM系统
        // 将类添加到全局变量
        window.CRMService = CRMService;