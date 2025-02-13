TRUNCATE TABLE role;

INSERT INTO `role`(`name`, `code`) VALUES
('超级管理员', 1),
('管理员', 2),
('普通用户', 3),
('访客用户', 4)
;

insert into `user`(`name`, `password`, `roleId`) values('admin','e1ea532cc067acedc149d39a87716f3f', 1) ON DUPLICATE KEY UPDATE roleId=roleId;
