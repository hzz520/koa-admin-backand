TRUNCATE TABLE role;

INSERT INTO `role`(`name`, `code`) VALUES
('超级管理员', 1),
('管理员', 2),
('普通用户', 3),
('访客用户', 4)
;

insert into `user`(`name`, `password`, `roleId`) 
select 'admin','e1ea532cc067acedc149d39a87716f3f',1 FROM dual 
where not exists (
  select roleId from user where roleId = 1
);

insert into `user`(`name`, `password`, `roleId`) 
select '张三','a3aa6035b15bb6ea4041a939c315914a',3 FROM dual 
where not exists (
  select name from user where name = '张三'
);
