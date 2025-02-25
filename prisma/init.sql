TRUNCATE TABLE role;

INSERT INTO `role`(`name`, `code`) VALUES
('超级管理员', 'superAdmin'),
('管理员', 'admin'),
('普通用户', 'user'),
('访客用户', 'guest')
;

TRUNCATE TABLE category;

INSERT INTO `category`(`name`, `code`) VALUES
('业财', 'finance'),
('订单', 'order'),
('履约', 'performance'),
('采购', 'purchase'),
('库存', 'stock'),
('基础', 'base'),
('系统', 'system')
;

insert into `user`(`name`, `password`, `roleId`) 
select 'admin','e1ea532cc067acedc149d39a87716f3f',1 FROM dual 
where not exists (
  select roleId from user where roleId = 1
);

insert into `user`(`name`, `password`, `roleId`) 
select '张三','a3aa6035b15bb6ea4041a939c315914a',2 FROM dual 
where not exists (
  select name from user where name = '张三'
);
