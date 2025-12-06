class ProjectManagementSystem {
            constructor() {
                this.projects = new Map();
                this.tasks = new Map();
                this.teams = new Map();
                this.milestones = new Map();
                this.initializeSampleData();
            }

            initializeSampleData() {
                // 模拟项目数据
                const sampleProjects = [
                    {
                        id: 'proj_001',
                        name: '腾讯云短信集成',
                        description: '集成腾讯云短信服务到主系统',
                        status: 'active',
                        priority: 'high',
                        startDate: new Date('2024-01-15'),
                        endDate: new Date('2024-03-15'),
                        budget: 50000,
                        progress: 75,
                        teamMembers: ['user_001', 'user_002', 'user_003'],
                        tags: ['API集成', '短信', '腾讯云']
                    },
                    {
                        id: 'proj_002',
                        name: '用户参与度提升',
                        description: '用户参与度增长需要提升',
                        status: 'active',
                        priority: 'medium',
                        startDate: new Date('2024-01-28'),
                        endDate: new Date('2024-02-28'),
                        budget: 20000,
                        progress: 40,
                        teamMembers: ['user_004', 'user_005'],
                        tags: ['用户体验', '数据分析', '优化']
                    }
                ];

                sampleProjects.forEach(project => this.projects.set(project.id, project));

                // 模拟任务数据
                const sampleTasks = [
                    {
                        id: 'task_001',
                        projectId: 'proj_001',
                        title: 'API接口开发',
                        description: '开发短信发送API接口',
                        assignee: 'user_001',
                        dueDate: new Date('2024-02-15'),
                        estimatedHours: 40,
                        actualHours: 35,
                        status: 'completed',
                        priority: 'high'
                    },
                    {
                        id: 'task_002',
                        projectId: 'proj_001',
                        title: '用户参与度增长缓慢',
                        description: '分析用户参与度数据',
                        assignee: 'user_004',
                        dueDate: new Date('2024-02-15'),
                        estimatedHours: 20,
                        actualHours: 18,
                        status: 'in_progress',
                        priority: 'medium'
                    }
                ];

                sampleTasks.forEach(task => this.tasks.set(task.id, task));
            }

            // 创建新项目
            createProject(projectData) {
                const projectId = 'proj_' + Date.now();
                const project = {
                    id: projectId,
                    ...projectData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    progress: 0,
                    teamMembers: []
                };
                this.projects.set(projectId, project);
                return project;
            }

            // 获取项目统计
            getProjectStats() {
                const projects = Array.from(this.projects.values());
                const completed = projects.filter(p => p.status === 'completed').length;
                const total = projects.length;
                const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
                const avgProgress = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;
                
                return {
                    total,
                    completed,
                    completionRate: Math.round((completed / total) * 100),
                    totalBudget: this.formatCurrency(totalBudget),
                    avgProgress: Math.round(avgProgress)
                };
            }

            // 格式化货币
            formatCurrency(amount) {
                return '¥' + amount.toLocaleString();
            }

            // 更新项目进度
            updateProjectProgress(projectId, progress) {
                const project = this.projects.get(projectId);
                if (project) {
                    project.progress = Math.max(0, Math.min(100, progress));
                    project.updatedAt = new Date();
                    return true;
                }
                return false;
            }

            // 获取项目任务
            getProjectTasks(projectId) {
                return Array.from(this.tasks.values())
                    .filter(task => task.projectId === projectId)
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            }

            // 项目成本分析
            analyzeProjectCost(projectId) {
                const project = this.projects.get(projectId);
                if (!project) return null;

                const tasks = this.getProjectTasks(projectId);
                const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
                const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
                
                const hourlyRate = 150; // 假设每小时成本
                const estimatedCost = totalEstimatedHours * hourlyRate;
                const actualCost = totalActualHours * hourlyRate;
                const budgetRemaining = project.budget - actualCost;
                
                return {
                    budget: project.budget,
                    budgetUtilization: (actualCost / project.budget) * 100,
                    estimatedCost,
                    actualCost,
                    budgetRemaining,
                    costVariance: actualCost - estimatedCost
                };
            }
        }

        // 实例化项目管理系统
        const projectManager = new ProjectManagementSystem();