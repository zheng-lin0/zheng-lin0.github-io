/**
 * 用户管理模块 - 处理用户认证、角色管理和权限控制
 * @module UserManagement
 */

/**
 * 用户管理类
 * @class UserManagement
 */
class UserManagement {
    /**
     * 构造函数
     * @constructor
     */
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.rolePermissions = {
            '超级管理员': ['adminPanel', 'adminResources', 'userManagement', 'allFeatures'],
            '管理员': ['adminResources', 'userManagement', 'allFeatures'],
            '普通用户': ['userFeatures']
        };
        this.isInitialized = false;
        
        // 使用共享的Supabase客户端实例
        this.supabase = window.supabaseClient;
        
        if (!this.supabase) {
            console.warn('共享Supabase客户端未初始化，将使用localStorage模式');
        }
    }

    /**
     * 初始化用户数据
     * @private
     * @returns {Array} 用户数据数组
     */
    async initUsers() {
        // 默认用户数据（使用正确的密码）
        const defaultUsers = [
            { username: 'zhenglin', password: '134625', email: 'zhenglin@example.com', role: '超级管理员' },
            { username: 'admin', password: 'admin123', email: 'admin@example.com', role: '管理员' },
            { username: 'test', password: 'test123', email: 'test@example.com', role: '普通用户' }
        ];

        if (!this.supabase) {
            console.warn('Supabase未配置，回退到localStorage');
            // 回退到localStorage
            const storedUsers = localStorage.getItem('users');
            if (storedUsers) {
                return JSON.parse(storedUsers);
            }

            localStorage.setItem('users', JSON.stringify(defaultUsers));
            return defaultUsers;
        }

        try {
            // 从Supabase获取用户数据
            const { data, error } = await this.supabase
                .from('users')
                .select('*');

            if (error) {
                console.error('获取用户数据失败:', error);
                // 失败时回退到默认用户
                localStorage.setItem('users', JSON.stringify(defaultUsers));
                return defaultUsers;
            }

            // 如果Supabase返回的用户列表为空或不包含默认用户，使用默认用户
            if (!data || data.length === 0 || !data.some(user => defaultUsers.some(defaultUser => defaultUser.username === user.username))) {
                console.warn('Supabase中没有用户数据或不包含默认用户，使用默认用户');
                localStorage.setItem('users', JSON.stringify(defaultUsers));
                return defaultUsers;
            }

            return data;
        } catch (error) {
            console.error('获取用户数据出错:', error);
            // 出错时回退到默认用户
            localStorage.setItem('users', JSON.stringify(defaultUsers));
            return defaultUsers;
        }
    }

    /**
     * 初始化模块
     * @public
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('UserManagement已经初始化');
            return;
        }

        try {
            this.users = await this.initUsers(); // 加载用户列表
            this.setupEventListeners();
            await this.loadCurrentUser();
            this.updateUserInterface();
            this.isInitialized = true;
            console.log('UserManagement模块初始化完成');
        } catch (error) {
            console.error('UserManagement初始化失败:', error);
        }
    }

    /**
     * 设置事件监听
     * @private
     */
    setupEventListeners() {
        // 登录表单提交
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('找到登录表单，尝试添加submit事件监听器');
            
            // 移除可能存在的旧监听器（使用bind确保上下文正确）
            if (this._handleLoginBound) {
                loginForm.removeEventListener('submit', this._handleLoginBound);
            }
            
            // 创建并保存绑定后的监听器函数
            this._handleLoginBound = (e) => this.handleLogin(e);
            
            // 添加新的监听器
            loginForm.addEventListener('submit', this._handleLoginBound);
            
            console.log('登录表单submit事件监听器添加完成');
            
            // 添加额外的点击事件监听器到登录按钮
            const loginBtn = loginForm.querySelector('button[type="submit"]');
            if (loginBtn) {
                // 移除可能存在的旧监听器
                if (this._loginBtnClickBound) {
                    loginBtn.removeEventListener('click', this._loginBtnClickBound);
                }
                
                // 创建并保存绑定后的监听器函数
                this._loginBtnClickBound = (e) => {
                    console.log('登录按钮被点击');
                    // 如果表单可以提交，手动触发submit事件
                    if (loginForm.checkValidity()) {
                        console.log('表单验证通过，手动触发submit事件');
                        const submitEvent = new Event('submit', { 
                            bubbles: true, 
                            cancelable: true 
                        });
                        loginForm.dispatchEvent(submitEvent);
                        e.preventDefault();
                    }
                };
                
                // 添加新的监听器
                loginBtn.addEventListener('click', this._loginBtnClickBound);
            }
        } else {
            console.warn('未找到登录表单，稍后尝试重新绑定事件监听器');
            // 延迟一段时间后再次尝试绑定
            setTimeout(() => this.setupEventListeners(), 500);
        }

        // 注册表单提交
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // 密码强度检查
        const registerPassword = document.getElementById('registerPassword');
        if (registerPassword) {
            registerPassword.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        }

        // 确认密码验证
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', (e) => this.validateConfirmPassword());
        }

        // 密码显示/隐藏功能
        this.setupPasswordVisibilityToggle();
    }

    /**
     * 设置密码显示/隐藏功能
     * @private
     */
    setupPasswordVisibilityToggle() {
        const passwordFields = ['loginPassword', 'registerPassword', 'confirmPassword'];
        passwordFields.forEach(fieldId => {
            const passwordInput = document.getElementById(fieldId);
            if (passwordInput) {
                // 创建显示/隐藏切换按钮
                const toggleBtn = document.createElement('button');
                toggleBtn.type = 'button';
                toggleBtn.className = 'password-toggle-btn';
                toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
                toggleBtn.style.position = 'absolute';
                toggleBtn.style.right = '10px';
                toggleBtn.style.top = '50%';
                toggleBtn.style.transform = 'translateY(-50%)';
                toggleBtn.style.background = 'transparent';
                toggleBtn.style.border = 'none';
                toggleBtn.style.cursor = 'pointer';
                toggleBtn.style.color = 'var(--text-secondary)';
                toggleBtn.style.padding = '5px';
                
                // 添加点击事件
                toggleBtn.addEventListener('click', () => {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    toggleBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
                });
                
                // 添加到父容器
                const parent = passwordInput.parentElement;
                if (parent) {
                    parent.style.position = 'relative';
                    parent.appendChild(toggleBtn);
                }
            }
        });
    }

    /**
     * 检查密码强度
     * @private
     * @param {string} password - 密码字符串
     */
    checkPasswordStrength(password) {
        let strength = 0;
        let strengthText = '弱';
        let strengthColor = '#ff4444';
        
        // 长度检查
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        
        // 复杂度检查
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        // 确定强度等级
        if (strength <= 2) {
            strengthText = '弱';
            strengthColor = '#ff4444';
        } else if (strength <= 4) {
            strengthText = '中';
            strengthColor = '#ff9800';
        } else {
            strengthText = '强';
            strengthColor = '#4caf50';
        }
        
        // 更新UI
        const strengthElement = document.getElementById('passwordStrength');
        const strengthBar = document.getElementById('passwordStrengthBar');
        
        if (strengthElement) {
            strengthElement.textContent = strengthText;
        }
        
        if (strengthBar) {
            strengthBar.style.width = `${strength * 20}%`;
            strengthBar.style.backgroundColor = strengthColor;
        }
    }

    /**
     * 验证确认密码
     * @private
     */
    validateConfirmPassword() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorElement = document.getElementById('confirmPasswordError');
        
        if (errorElement) {
            if (password !== confirmPassword) {
                errorElement.textContent = '两次输入的密码不一致';
            } else {
                errorElement.textContent = '';
            }
        }
    }

    /**
     * 处理localStorage模式下的登录
     * @private
     * @param {string} username - 用户名
     * @param {string} password - 密码
     */
    handleLocalStorageLogin(username, password) {
        console.log('使用localStorage模式登录');
        
        // 默认用户数据（确保使用正确的密码）
        const defaultUsers = [
            { username: 'zhenglin', password: '134625', email: 'zhenglin@example.com', role: '超级管理员' },
            { username: 'admin', password: 'admin123', email: 'admin@example.com', role: '管理员' },
            { username: 'test', password: 'test123', email: 'test@example.com', role: '普通用户' }
        ];
        
        // 首先尝试从当前用户列表中查找
        let user = this.users.find(u => 
            (u.username === username || u.username.toLowerCase() === username.toLowerCase()) && 
            u.password === password
        );
        
        // 如果当前用户列表中没有找到，直接从默认用户列表中查找
        if (!user) {
            console.log('当前用户列表中未找到，从默认用户列表查找');
            user = defaultUsers.find(u => 
                (u.username === username || u.username.toLowerCase() === username.toLowerCase()) && 
                u.password === password
            );
            
            // 如果从默认用户列表中找到了用户，更新localStorage
            if (user) {
                console.log('从默认用户列表中找到用户，更新localStorage');
                localStorage.setItem('users', JSON.stringify(defaultUsers));
                this.users = defaultUsers;
            }
        }
        
        console.log('找到的用户:', user);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateUserInterface();
            closeModal('loginModal');
            
            // 触发用户登录成功事件
            document.dispatchEvent(new CustomEvent('user:login', { detail: user }));
            
            // 显示登录成功通知
            if (window.notificationSystem) {
                window.notificationSystem.showNotification('登录成功！', 'success');
            }
        } else {
            // 显示错误信息
            const errorElement = document.getElementById('loginUsernameError');
            if (errorElement) {
                errorElement.textContent = '用户名或密码错误';
            }
            
            // 调试信息：显示所有用户的用户名和密码
            console.log('=== 所有用户详细信息 ===');
            this.users.forEach((user, index) => {
                console.log(`用户${index + 1}:`, { 
                    username: user.username, 
                    password: user.password, 
                    matchUsername: user.username === username, 
                    matchPassword: user.password === password
                });
            });
        }
    }

    /**
     * 处理登录
     * @private
     * @param {Event} e - 表单提交事件
     */
    async handleLogin(e) {
        e.preventDefault();
        
        // 获取并修剪用户名和密码（移除前后空格）
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        console.log('=== 登录调试信息 ===');
        console.log('登录尝试:', { username, password });
        console.log('当前用户列表:', this.users);
        console.log('localStorage中的用户:', localStorage.getItem('users'));
        
        if (!this.supabase) {
            // 回退到localStorage
            this.handleLocalStorageLogin(username, password);
            return;
        }

        try {
            // 首先根据用户名查找用户的邮箱
            const { data: userByUsername, error: usernameError } = await this.supabase
                .from('users')
                .select('email')
                .eq('username', username)
                .single();

            if (usernameError || !userByUsername) {
                console.error('Supabase查找用户失败，回退到localStorage:', usernameError);
                // Supabase查找失败，回退到localStorage模式
                this.handleLocalStorageLogin(username, password);
                return;
            }

            // 使用找到的邮箱进行登录
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: userByUsername.email,
                password: password
            });

            if (error) {
                console.error('登录失败:', error);
                document.getElementById('loginUsernameError').textContent = '用户名或密码错误';
                return;
            }

            // 获取用户详细信息
            const { data: userProfile, error: profileError } = await this.supabase
                .from('users')
                .select('*')
                .eq('email', userByUsername.email)
                .single();

            if (profileError) {
                console.error('获取用户信息失败:', profileError);
                document.getElementById('loginUsernameError').textContent = '获取用户信息失败';
                return;
            }

            this.currentUser = userProfile;
            localStorage.setItem('currentUser', JSON.stringify(userProfile));
            this.updateUserInterface();
            closeModal('loginModal');
            
            // 触发用户登录成功事件
            document.dispatchEvent(new CustomEvent('user:login', { detail: userProfile }));
            
            // 显示登录成功通知
            if (window.notificationSystem) {
                window.notificationSystem.showNotification('登录成功！', 'success');
            }
        } catch (error) {
            console.error('登录出错:', error);
            document.getElementById('loginUsernameError').textContent = '登录过程中发生错误';
        }
    }

    /**
     * 处理注册
     * @private
     * @param {Event} e - 表单提交事件
     */
    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const email = document.getElementById('registerEmail').value;
        
        if (!this.supabase) {
            // 回退到localStorage
            // 检查用户名是否已存在
            if (this.users.find(u => u.username === username)) {
                document.getElementById('registerUsernameError').textContent = '用户名已存在';
                return;
            }
            
            // 创建新用户
            const newUser = {
                username: username,
                password: password,
                email: email,
                role: '普通用户',
                status: 'active'
            };
            
            // 添加到用户列表
            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));
            
            // 自动登录新用户
            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            this.updateUserInterface();
            closeModal('registerModal');
            
            // 显示注册成功通知
            if (window.notificationSystem) {
                window.notificationSystem.showNotification('注册成功！', 'success');
            }
            return;
        }

        try {
            // 检查用户名是否已存在
            const { data: existingUsers, error: checkError } = await this.supabase
                .from('users')
                .select('username')
                .eq('username', username);

            if (checkError) {
                console.error('检查用户名失败:', checkError);
                document.getElementById('registerUsernameError').textContent = '检查用户名时出错';
                return;
            }

            if (existingUsers && existingUsers.length > 0) {
                document.getElementById('registerUsernameError').textContent = '用户名已存在';
                return;
            }

            // 使用Supabase创建用户并自动确认邮箱
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email: email,
                password: password
            }, {
                // 添加自动确认邮箱配置
                emailRedirectTo: window.location.origin, // 重定向到当前网站
                data: { email_confirm: true } // 标记邮箱已确认
            });

            if (authError) {
                console.error('创建用户失败:', authError);
                document.getElementById('registerUsernameError').textContent = '创建用户失败';
                return;
            }

            // 创建用户资料
            const { error: profileError } = await this.supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    username: username,
                    email: email,
                    password: password, // 注意：在实际应用中应该使用Supabase的认证系统，而不是直接存储密码
                    role: '普通用户',
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                console.error('创建用户资料失败:', profileError);
                document.getElementById('registerUsernameError').textContent = '创建用户资料失败';
                return;
            }

            // 获取完整用户信息
            const { data: userProfile, error: fetchError } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (fetchError) {
                console.error('获取用户信息失败:', fetchError);
                document.getElementById('registerUsernameError').textContent = '获取用户信息失败';
                return;
            }

            // 自动登录新用户
            this.currentUser = userProfile;
            localStorage.setItem('currentUser', JSON.stringify(userProfile));
            
            this.updateUserInterface();
            closeModal('registerModal');
            
            // 显示注册成功通知
            if (window.notificationSystem) {
                window.notificationSystem.showNotification('注册成功！', 'success');
            }
        } catch (error) {
            console.error('注册出错:', error);
            document.getElementById('registerUsernameError').textContent = '注册过程中发生错误';
        }
    }

    /**
     * 登出
     * @public
     */
    async logout() {
        if (this.supabase) {
            try {
                await this.supabase.auth.signOut();
            } catch (error) {
                console.error('登出失败:', error);
            }
        }
        
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUserInterface();
        
        // 触发用户登出事件
        document.dispatchEvent(new CustomEvent('user:logout'));
        
        // 显示登出成功通知
        if (window.notificationSystem) {
            window.notificationSystem.showNotification('已成功登出', 'info');
        }
    }

    /**
     * 加载当前用户
     * @private
     */
    async loadCurrentUser() {
        if (this.supabase) {
            try {
                // 从Supabase获取当前会话用户
                const { data: { user } } = await this.supabase.auth.getUser();
                
                if (user) {
                    // 获取用户资料
                    const { data: userProfile, error } = await this.supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    
                    if (userProfile) {
                        this.currentUser = userProfile;
                        localStorage.setItem('currentUser', JSON.stringify(userProfile));
                    }
                } else {
                    // Supabase Auth未找到用户，但仍需检查localStorage作为回退
                    const storedUser = localStorage.getItem('currentUser');
                    if (storedUser) {
                        this.currentUser = JSON.parse(storedUser);
                    }
                }
            } catch (error) {
                console.error('加载当前用户失败:', error);
                // 回退到localStorage
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    this.currentUser = JSON.parse(storedUser);
                }
            }
        } else {
            // 回退到localStorage
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
            }
        }
    }

    /**
     * 更新用户界面
     * @private
     */
    updateUserInterface() {
        console.log('=== 更新用户界面 ===');
        console.log('当前用户:', this.currentUser);
        
        const userProfile = document.getElementById('userProfile');
        const loginElements = document.querySelectorAll('.navbar-buttons button');
        const adminResourcesLink = document.getElementById('adminResourcesLink');
        const adminPanelLink = document.getElementById('adminPanelLink');
        const userName = document.getElementById('userName');
        const userLevel = document.getElementById('userLevel');
        const userNavItem = document.getElementById('userActions'); // 添加用户导航项定义
        const loginButton = document.querySelector('.btn.btn-outline'); // 添加登录按钮定义

        if (this.currentUser) {
            // 用户已登录
            console.log('用户已登录，更新界面以显示用户信息');
            
            if (userProfile) {
                userProfile.style.display = 'flex';
                console.log('显示用户资料');
            }
            
            // 隐藏登录按钮
            loginElements.forEach(button => {
                button.style.display = 'none';
            });
            
            // 也隐藏导航栏中的登录链接（添加错误处理）
            try {
                const loginIcon = document.querySelector('.nav-link i.fas.fa-sign-in-alt');
                if (loginIcon && loginIcon.parentElement) {
                    const loginNavLink = loginIcon.parentElement;
                    loginNavLink.style.display = 'none';
                    console.log('隐藏导航栏登录链接');
                }
            } catch (error) {
                console.warn('隐藏登录导航链接失败:', error);
            }
            
            // 更新用户信息
            if (userName) {
                userName.textContent = this.currentUser.username;
                console.log('更新用户名显示:', userName.textContent);
            }
            
            if (userLevel) {
                // 显示用户等级
                let level = this.currentUser.level || '普通会员';
                
                // 检查用户角色，如果是管理员或超级管理员，直接设为最高级会员
                if (this.currentUser.role === '超级管理员' || this.currentUser.role === '管理员') {
                    level = '至尊会员';
                    this.currentUser.level = level; // 更新当前用户的等级信息
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                } 
                // 如果不是管理员，根据积分更新等级
                else if (window.membershipSystem && this.currentUser.points !== undefined) {
                    level = this.getLevelByPoints(this.currentUser.points);
                    this.currentUser.level = level; // 更新当前用户的等级信息
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                }
                
                userLevel.textContent = level;
                console.log('更新用户等级显示:', userLevel.textContent);
                
                // 根据等级设置徽章样式
                userLevel.className = 'user-level';
                if (level === '钻石会员' || level === '超级VIP') {
                    userLevel.classList.add('diamond');
                } else if (level === '高级会员') {
                    userLevel.classList.add('premium');
                } else if (level === 'VIP会员') {
                    userLevel.classList.add('vip');
                } else {
                    userLevel.classList.add('regular');
                }
            }
            
            // 根据角色显示管理员功能
            this.updateAdminLinksVisibility();
        } else {
            // 用户未登录
            console.log('用户未登录，更新界面以显示登录选项');
            
            if (userNavItem) {
                userNavItem.style.display = 'none';
                console.log('隐藏用户导航项');
            }
            
            if (loginButton) {
                loginButton.style.display = 'block';
                console.log('显示登录按钮');
            }
            
            // 显示导航栏中的登录链接（安全的DOM元素查找）
            const loginNavLinkElement = document.querySelector('.nav-link i.fas.fa-sign-in-alt');
            if (loginNavLinkElement) {
                const loginNavLink = loginNavLinkElement.parentElement;
                if (loginNavLink) {
                    loginNavLink.style.display = 'inline-block';
                    console.log('显示导航栏登录链接');
                }
            } else {
                console.log('未找到登录导航链接元素');
            }
            
            if (adminResourcesLink) adminResourcesLink.style.display = 'none';
            if (adminPanelLink) adminPanelLink.style.display = 'none';
        }
    }

    /**
     * 更新管理员链接的可见性
     * @private
     */
    updateAdminLinksVisibility() {
        const adminResourcesLink = document.getElementById('adminResourcesLink');
        const adminPanelLink = document.getElementById('adminPanelLink');

        if (this.currentUser) {
            if (this.hasPermission('adminResources')) {
                if (adminResourcesLink) adminResourcesLink.style.display = 'block';
            } else {
                if (adminResourcesLink) adminResourcesLink.style.display = 'none';
            }

            if (this.hasPermission('adminPanel')) {
                if (adminPanelLink) adminPanelLink.style.display = 'block';
            } else {
                if (adminPanelLink) adminPanelLink.style.display = 'none';
            }
        }
    }

    /**
     * 检查用户是否有指定权限
     * @public
     * @param {string} permission - 权限名称
     * @returns {boolean} 是否有该权限
     */
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const userPermissions = this.rolePermissions[this.currentUser.role] || [];
        return userPermissions.includes(permission) || userPermissions.includes('allFeatures');
    }

    /**
     * 获取当前用户
     * @public
     * @returns {Object|null} 当前用户对象
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 获取当前用户角色
     * @public
     * @returns {string|null} 当前用户角色
     */
    getCurrentUserRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    /**
     * 获取当前用户等级
     * @public
     * @returns {string|null} 当前用户等级
     */
    getCurrentUserLevel() {
        return this.currentUser ? this.currentUser.level || '普通会员' : null;
    }

    /**
     * 根据积分获取用户等级
     * @public
     * @param {number} points - 积分
     * @returns {string} 用户等级
     */
    getLevelByPoints(points) {
        if (window.membershipSystem) {
            const memberLevel = window.membershipSystem.getMemberLevel(points);
            return memberLevel.name;
        }
        
        // 默认等级映射（当MembershipSystem不可用时）
        if (points >= 15000) return '钻石会员';
        if (points >= 10000) return '超级VIP';
        if (points >= 5000) return 'VIP会员';
        if (points >= 1000) return '高级会员';
        return '普通会员';
    }

    /**
     * 设置用户等级
     * @public
     * @param {string} userId - 用户ID
     * @param {string} level - 新等级
     * @returns {boolean} 是否设置成功
     */
    async setUserLevel(userId, level) {
        const validLevels = ['普通会员', '高级会员', 'VIP会员', '超级VIP', '钻石会员'];
        if (!validLevels.includes(level)) {
            console.error('无效的用户等级');
            return false;
        }

        if (this.supabase) {
            try {
                const { error } = await this.supabase
                    .from('users')
                    .update({ level: level })
                    .eq('id', userId);

                if (!error) {
                    // 更新当前用户信息
                    if (this.currentUser && this.currentUser.id === userId) {
                        this.currentUser.level = level;
                        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                        this.updateUserInterface();
                    }
                    return true;
                }
                console.error('设置用户等级失败:', error);
                return false;
            } catch (error) {
                console.error('设置用户等级出错:', error);
                return false;
            }
        } else {
            // 回退到localStorage
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                this.users[userIndex].level = level;
                localStorage.setItem('users', JSON.stringify(this.users));

                // 更新当前用户信息
                if (this.currentUser && this.currentUser.id === userId) {
                    this.currentUser.level = level;
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    this.updateUserInterface();
                }
                return true;
            }
            return false;
        }
    }

    /**
     * 销毁模块
     * @public
     */
    destroy() {
        this.isInitialized = false;
        console.log('UserManagement模块已销毁');
    }

    /**
     * 获取所有可用的会员等级
     * @public
     * @returns {Array} 会员等级列表
     */
    getAvailableLevels() {
        return ['普通会员', '高级会员', 'VIP会员', '超级VIP'];
    }
}

// 导出单例
const userManagement = new UserManagement();

// 初始化完成后触发事件
document.addEventListener('DOMContentLoaded', () => {
    document.dispatchEvent(new CustomEvent('userManagementInitialized', {
        detail: userManagement
    }));
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = userManagement;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return userManagement; });
} else {
    window.userManagement = userManagement;
    
    // 添加全局登录函数，确保登录功能可以被调用
    window.login = async function(username, password) {
        console.log('全局login函数被调用:', username, password);
        
        // 填充表单字段
        const usernameInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        if (usernameInput) usernameInput.value = username;
        if (passwordInput) passwordInput.value = password;
        
        // 模拟表单提交事件
        const e = { preventDefault: () => console.log('阻止默认行为') };
        
        // 调用handleLogin方法
        await userManagement.handleLogin(e);
    };
    
    // 添加会员等级相关的全局函数
    window.changeUserLevel = function(userId, level) {
        console.log('全局changeUserLevel函数被调用:', userId, level);
        userManagement.setUserLevel(userId, level);
    };
    
    // 添加全局切换认证标签页函数
    window.switchAuthTab = function(tabName) {
        try {
            // 隐藏所有标签页内容
            const tabContents = document.querySelectorAll('.auth-tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // 移除所有标签按钮的活跃状态
            const tabButtons = document.querySelectorAll('.auth-tab-btn');
            tabButtons.forEach(button => {
                button.classList.remove('active');
            });
            
            // 显示选中的标签页内容
            const selectedContent = document.getElementById(`${tabName}Tab`);
            if (selectedContent) {
                selectedContent.classList.add('active');
            }
            
            // 激活选中的标签按钮
            const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
            if (selectedButton) {
                selectedButton.classList.add('active');
            }
        } catch (error) {
            console.error('切换认证标签页失败:', error);
        }
    };
    
    // 添加全局模态框控制函数
    window.openLoginModal = function() {
        try {
            // 使用modalSystem打开模态框
            if (window.modalSystem) {
                window.modalSystem.openModal('loginModal');
            } else {
                // 降级方案：直接操作DOM
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                } else {
                    console.warn('loginModal元素不存在，无法打开登录模态框');
                }
            }
        } catch (error) {
            console.error('打开登录模态框失败:', error);
            // 降级方案：直接操作DOM
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            } else {
                console.warn('loginModal元素不存在，无法打开登录模态框');
            }
        }
    };
    
    window.openRegisterModal = function() {
        try {
            // 使用modalSystem打开模态框
            if (window.modalSystem) {
                window.modalSystem.openModal('registerModal');
            } else {
                // 降级方案：直接操作DOM
                const registerModal = document.getElementById('registerModal');
                if (registerModal) {
                    registerModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                } else {
                    console.warn('registerModal元素不存在，无法打开注册模态框');
                }
            }
        } catch (error) {
            console.error('打开注册模态框失败:', error);
            // 降级方案：直接操作DOM
            const registerModal = document.getElementById('registerModal');
            if (registerModal) {
                registerModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            } else {
                console.warn('registerModal元素不存在，无法打开注册模态框');
            }
        }
    };
}
