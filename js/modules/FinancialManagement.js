// 财务管理系统
    class FinancialManagementSystem {
            constructor() {
                this.transactions = new Map();
                this.invoices = new Map();
                this.budgets = new Map();
                this.expenses = new Map();
                this.reports = new Map();
                this.initializeSampleData();
            }

            initializeSampleData() {
                // 模拟交易数据
                const sampleTransactions = [
                    {
                        id: 'txn_001',
                        type: 'income',
                        amount: 240000,
                        category: 'subscription',
                        vendor: '字节跳动',
                        date: new Date('2024-01-25'),
                        description: '月度订阅收入'
                    },
                    {
                        id: 'txn_002',
                        type: 'expense',
                        amount: 50000,
                        category: 'salary',
                        vendor: '内部',
                        date: new Date('2024-01-28'),
                        description: '员工工资'
                    }
                ];

                sampleTransactions.forEach(transaction => this.transactions.set(transaction.id, transaction));

                // 模拟预算数据
                const sampleBudgets = [
                    {
                        id: 'budget_001',
                        category: 'marketing',
                        amount: 100000,
                        period: 'quarter',
                        spent: 80000
                    }
                ];

                sampleBudgets.forEach(budget => this.budgets.set(budget.id, budget));
            }

            // 记录交易
            recordTransaction(transactionData) {
                const transactionId = 'txn_' + Date.now();
                const transaction = {
                    id: transactionId,
                    ...transactionData,
                    recordedAt: new Date()
                };
                this.transactions.set(transactionId, transaction);
                return transaction;
            }

            // 获取财务概览
            getFinancialOverview(period = 'month') {
                const transactions = this.getTransactionsByPeriod(period);
                const income = transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const expenses = transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                const netIncome = income - expenses;

                return {
                    income: this.formatCurrency(income),
                    expenses: this.formatCurrency(expenses),
                    netIncome: this.formatCurrency(netIncome),
                    profitMargin: income > 0 ? (netIncome / income) * 100 : 0
                };
            }

            // 生成财务报表
            generateFinancialReport(period = 'month') {
                const transactions = this.getTransactionsByPeriod(period);
                const overview = this.getFinancialOverview(period);

                return {
                    period,
                    overview,
                    transactions: transactions.length,
                    topCustomers: this.getTopCustomers(transactions),
                    budgetAnalysis: this.getBudgetAnalysis()
                };
            }

            // 按时间段获取交易
            getTransactionsByPeriod(period) {
                const today = new Date();
                let startDate;

                switch(period) {
                    case 'month':
                        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                        break;
                    case 'quarter':
                        const quarter = Math.floor(today.getMonth() / 3);
                        startDate = new Date(today.getFullYear(), quarter * 3, 1);
                        break;
                    case 'year':
                        startDate = new Date(today.getFullYear(), 0, 1);
                        break;
                    default:
                        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                }

                return Array.from(this.transactions.values())
                    .filter(t => new Date(t.date) >= startDate && new Date(t.date) <= today);
            }

            // 获取顶级客户
            getTopCustomers(transactions) {
                const customerRevenue = {};
                transactions
                    .filter(t => t.type === 'income')
                    .forEach(t => {
                        customerRevenue[t.vendor] = (customerRevenue[t.vendor] || 0) + t.amount;
                    });

                return Object.entries(customerRevenue)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([customer, revenue]) => ({
                        customerName: customer,
                        revenue: this.formatCurrency(revenue)
                    }));
            }

            // 预算分析
            getBudgetAnalysis() {
                const budgets = Array.from(this.budgets.values());
                return budgets.map(budget => ({
                    category: budget.category,
                    allocated: this.formatCurrency(budget.amount),
                    remaining: this.formatCurrency(budget.amount - budget.spent),
                    utilization: (budget.spent / budget.amount) * 100
                }));
            }

            // 现金流分析
            analyzeCashFlow() {
                const transactions = this.getTransactionsByPeriod('year');
                const monthlyData = {};

                transactions.forEach(t => {
                    const monthKey = new Date(t.date).toISOString().substring(0, 7);
                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { income: 0, expenses: 0 };
                    }
                    monthlyData[monthKey][t.type === 'income' ? 'income' : 'expenses'] += t.amount;
                });

                return Object.entries(monthlyData).map(([month, data]) => ({
                    month,
                    income: data.income,
                    expenses: data.expenses,
                    netCashFlow: data.income - data.expenses
                }));
            }

            // 格式化货币
            formatCurrency(amount) {
                return '¥' + amount.toLocaleString();
            }
        }

        // 将类添加到全局变量
        window.FinancialManagementSystem = FinancialManagementSystem;