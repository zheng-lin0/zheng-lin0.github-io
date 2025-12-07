# Supabase数据迁移建议

## 是否需要清除之前的数据？

根据迁移脚本和应用程序代码的分析，是否需要清除之前的Supabase数据取决于以下情况：

### 1. 首次设置Supabase（推荐）
如果这是你第一次在Supabase上部署此应用程序，**不需要清除任何数据**。

迁移脚本具有以下特性：
- 使用`CREATE TABLE IF NOT EXISTS`创建表，不会删除现有表
- 使用`ON CONFLICT DO NOTHING`插入默认数据，不会覆盖现有记录

直接执行迁移脚本即可创建所需的表结构和默认数据。

### 2. Supabase上已有相关表和数据
如果Supabase上已经存在相关表和数据，请根据以下情况决定：

#### 情况A：现有表结构与迁移脚本一致
- **不需要清除数据**
- 迁移脚本会跳过已存在的表
- 默认数据插入会跳过已存在的记录

#### 情况B：现有表结构与迁移脚本不一致
- **建议先备份数据，然后清除或修改表结构**
- 表结构不一致可能导致应用程序功能异常
- 可以使用以下方式处理：
  - 手动修改现有表以匹配迁移脚本的结构
  - 清除现有表（备份数据后）并重新执行迁移脚本
  - 创建新的Supabase项目并从头开始

#### 情况C：现有数据与应用程序不兼容
- **需要清除或迁移数据**
- 如果现有数据格式与应用程序预期不匹配，可能导致功能异常
- 可以通过SQL查询导出重要数据，转换后重新导入

## 数据清除方法

### 方法1：在Supabase控制台手动清除
1. 登录Supabase控制台
2. 进入`Table Editor`
3. 选择要清除的表
4. 点击`Delete table`或`Empty table`

### 方法2：使用SQL语句清除
```sql
-- 清除单个表的所有数据
TRUNCATE TABLE table_name RESTART IDENTITY;

-- 清除所有相关表的所有数据
TRUNCATE TABLE users, user_sessions, user_preferences, user_installed_apps, user_membership, user_download_history RESTART IDENTITY;
```

## 数据迁移注意事项

1. **备份重要数据**：在执行任何可能影响数据的操作前，务必备份重要数据
2. **测试环境验证**：建议先在测试环境中验证迁移过程
3. **渐进式迁移**：可以分阶段迁移不同类型的数据，减少风险
4. **功能验证**：迁移后务必测试所有关键功能，确保数据正确加载和保存

## 应用程序数据同步机制

应用程序代码已实现以下数据同步机制：

1. **优先使用Supabase**：所有数据操作优先尝试使用Supabase
2. **localStorage回退**：如果Supabase操作失败，会使用localStorage作为备份
3. **数据加载顺序**：先尝试从Supabase加载数据，如果失败则从localStorage加载

这种设计确保了即使在网络连接不稳定或Supabase出现问题时，应用程序仍能正常运行。