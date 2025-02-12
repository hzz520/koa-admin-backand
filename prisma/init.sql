SET FOREIGN_KEY_CHECKS = 0; 
TRUNCATE TABLE role;
SET FOREIGN_KEY_CHECKS = 1; 

INSERT INTO `role`(`name`, `code`) VALUES
('超级管理员', 1),
('管理员', 2),
('普通用户', 3),
('访客用户', 4)
;

