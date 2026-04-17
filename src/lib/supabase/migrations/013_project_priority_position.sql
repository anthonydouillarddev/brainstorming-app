-- 013: Project priority + position (classement manuel + drag & drop)
alter table projects
  add column if not exists priority text default 'none'
    check (priority in ('none', 'urgent', 'high', 'normal', 'low'));

alter table projects
  add column if not exists position integer default 0;

create index if not exists projects_priority_position_idx
  on projects (user_id, priority, position);
