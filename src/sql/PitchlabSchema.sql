create table pitchlab.users(
	id int primary key not null identity,
	username varchar(512) not null,
	pwdHash binary(64) not null,
	emailId varchar(512) not null unique,
	firstname varchar(128),
	lastname varchar (128),
	add1 varchar(1024),
    add2 varchar(1024),
    add3 varchar(1024),
    city varchar(1024),
    citystate varchar(1024),
    country VARCHAR(1024),
    zip varchar(16),
    phones varchar(1024),
	imageUrl varchar(4096),
    dob DATETIME2,
    notes varchar(1024),
    isActive bit DEFAULT 1,
    createDate DATETIME2 DEFAULT GETDATE()
);

alter table pitchlab.users add clientId int REFERENCES pitchlab.clients(id);

CREATE TABLE pitchlab.clients
(
    Id INT NOT NULL PRIMARY KEY IDENTITY, -- Primary Key column
    clientName NVARCHAR(1024) NOT NULL,
    add1 varchar(1024),
    add2 varchar(1024),
    add3 varchar(1024),
    city varchar(1024),
    citystate varchar(1024),
    country VARCHAR(1024),
    zip varchar(16)
);

create table pitchlab.roles (
	id int primary key IDENTITY,
    roleName varchar(256) not null unique,
    notes varchar(1024)
);

create table pitchlab.userRoleMap (
	id int primary key IDENTITY,
    userid int not null references pitchlab.users(id),
    roleId int not null references pitchlab.roles(id),
    createBy int not null references pitchlab.users(id),
    createDate DateTime not null DEFAULT GETDATE(),
    unique (userid, roleid)
);

    create table pitchlab.videos (
        Id INT NOT NULL PRIMARY KEY IDENTITY, 
        userid int not null references pitchlab.users(id),
        containerName varchar(1024) not null,
        videoBlobName varchar(1024) not null,
        videoBlobUrl varchar(1024) not null,
        audioBlobName varchar(1024) not null,
        audioBlobUrl varchar(1024) not null,
        createDate DATETIME2 DEFAULT GETDATE()
    );
