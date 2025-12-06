// 团队协作系统
    class CollaborationSystem {
            constructor() {
                this.teams = new Map();
                this.channels = new Map();
                this.messages = new Map();
                this.documents = new Map();
                this.meetings = new Map();
                this.initializeSampleData();
            }

            initializeSampleData() {
                // 模拟团队数据
                const sampleTeams = [
                    {
                        id: 'team_001',
                        name: '产品开发团队',
                        description: '负责产品开发和维护',
                        members: ['user_001', 'user_002', 'user_003'],
                        channels: ['product-general', 'product-dev', 'product-design'],
                        createdBy: 'user_001',
                        createdAt: new Date('2024-01-10')
                    },
                    {
                        id: 'team_002',
                        name: '营销团队',
                        description: '负责市场推广和客户获取',
                        members: ['user_004', 'user_005'],
                        channels: ['marketing-general', 'marketing-campaigns'],
                        createdBy: 'user_004',
                        createdAt: new Date('2024-01-15')
                    }
                ];

                sampleTeams.forEach(team => this.teams.set(team.id, team));

                // 模拟频道数据
                const sampleChannels = [
                    {
                        id: 'channel_001',
                        teamId: 'team_001',
                        name: 'product-general',
                        description: '产品团队通用频道',
                        isPrivate: false
                    },
                    {
                        id: 'channel_002',
                        teamId: 'team_002',
                        name: 'marketing-campaigns',
                        description: '营销活动讨论',
                        isPrivate: true
                    }
                ];

                sampleChannels.forEach(channel => this.channels.set(channel.id, channel));
            }

            // 创建新团队
            createTeam(teamData, createdBy) {
                const teamId = 'team_' + Date.now();
                const team = {
                    id: teamId,
                    ...teamData,
                    members: [],
                    channels: [],
                    createdBy,
                    createdAt: new Date()
                };
                this.teams.set(teamId, team);
                return team;
            }

            // 创建频道
            createChannel(channelData) {
                const channelId = 'channel_' + Date.now();
                const channel = {
                    id: channelId,
                    ...channelData,
                    createdAt: new Date()
                };
                this.channels.set(channelId, channel);
                
                // 添加到团队频道列表
                const team = this.teams.get(channelData.teamId);
                if (team) {
                    team.channels.push(channelId);
                }
                
                return channel;
            }

            // 发送消息
            sendMessage(channelId, senderId, content, attachments = []) {
                const messageId = 'msg_' + Date.now();
                const message = {
                    id: messageId,
                    channelId,
                    senderId,
                    content,
                    attachments,
                    timestamp: new Date(),
                    reactions: {},
                    replies: []
                };
                this.messages.set(messageId, message);
                return message;
            }

            // 创建共享文档
            createDocument(documentData, createdBy) {
                const documentId = 'doc_' + Date.now();
                const document = {
                    id: documentId,
                    ...documentData,
                    createdBy,
                    version: 1,
                    collaborators: [],
                    comments: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                this.documents.set(documentId, document);
                return document;
            }

            // 安排会议
            scheduleMeeting(meetingData, organizerId) {
                const meetingId = 'meeting_' + Date.now();
                const meeting = {
                    id: meetingId,
                    ...meetingData,
                    organizer: organizerId,
                    attendees: [],
                    agenda: [],
                    createdAt: new Date()
                };
                this.meetings.set(meetingId, meeting);
                return meeting;
            }

            // 获取团队活动统计
            getTeamActivityStats(teamId) {
                const team = this.teams.get(teamId);
                if (!team) return null;

                const channels = team.channels.map(channelId => this.channels.get(channelId));
                const channelMessages = channels.map(channel => 
                    Array.from(this.messages.values()).filter(msg => msg.channelId === channel.id).length
                );

                const totalMessages = channelMessages.reduce((sum, count) => sum + count, 0);

                const activeMembers = team.members.filter(memberId => {
                    const memberMessages = Array.from(this.messages.values())
                        .filter(msg => msg.senderId === memberId);
                    return memberMessages.length > 0;
                });

                return {
                    team: team.name,
                    totalMembers: team.members.length,
                    activeMembers: activeMembers.length,
                    totalChannels: channels.length,
                    activityRate: (activeMembers.length / team.members.length) * 100
                };
            }

            // 协作效率分析
            analyzeCollaborationEfficiency() {
                const teams = Array.from(this.teams.values());
                const totalTeams = teams.length;
                const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);
                const totalMessages = this.messages.size;
                const totalDocuments = this.documents.size;

                const avgTeamSize = totalTeams > 0 ? totalMembers / totalTeams : 0;
                const messagesPerTeam = totalTeams > 0 ? totalMessages / totalTeams : 0;
                const documentsPerTeam = totalTeams > 0 ? totalDocuments / totalTeams : 0;

                return {
                    totalTeams,
                    totalMembers,
                    avgTeamSize: Math.round(avgTeamSize),
                    messagesPerTeam: Math.round(messagesPerTeam),
                    documentsPerTeam: Math.round(documentsPerTeam),
                    collaborationScore: this.calculateCollaborationScore(teams)
                };
            }

            // 计算协作分数
            calculateCollaborationScore(teams) {
                let totalScore = 0;
                teams.forEach(team => {
                    const stats = this.getTeamActivityStats(team.id);
                    if (stats) {
                        const score = (stats.activityRate * 0.4) + (stats.totalMessages * 0.3) + (stats.totalDocuments * 0.3);
                        totalScore += score;
                    }
                });
                return Math.round(totalScore / teams.length);
            }

            // 搜索团队内容
            searchTeamContent(teamId, query) {
                const team = this.teams.get(teamId);
                if (!team) return [];

                const results = [];

                // 搜索消息
                Array.from(this.messages.values()).forEach(msg => {
                    if (team.channels.includes(msg.channelId) && 
                        msg.content.toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            type: 'message',
                            content: msg.content,
                            channel: this.channels.get(msg.channelId)?.name,
                            team: this.getTeamByChannel(msg.channelId)?.name
                        });
                    }
                });

                // 搜索文档
                Array.from(this.documents.values()).forEach(doc => {
                    if (doc.content?.toLowerCase().includes(query.toLowerCase())) {
                        results.push({
                            type: 'document',
                            content: doc.title || '未命名文档',
                            team: team.name
                        });
                    }
                });

                return results;
            }

            // 根据频道获取团队
            getTeamByChannel(channelId) {
                const channel = this.channels.get(channelId);
                if (!channel) return null;
                return this.teams.get(channel.teamId);
            }
        }

        // 将类添加到全局变量
        window.CollaborationSystem = CollaborationSystem;